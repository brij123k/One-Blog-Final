import {
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';

import { Model } from 'mongoose';

import { StoreIntelligence } from '../store-intelligence/schemas/store-intelligence.schema';

import { ShopifyService } from '../shopify/shopify.service';

import { AIService } from '../ai/ai.service';

import { GenerateBlogDto } from './dto/generate-blog.dto';
import { GenerateCampaignBlogDto } from './dto/generate-campaign-blog.dto';
import { Blog } from './schemas/blog.schema';
import { ImageService } from '../image/image.service';
ImageService
@Injectable()
export class BlogService {
    constructor(
        @InjectModel(StoreIntelligence.name)
        private readonly intelligenceModel: Model<StoreIntelligence>,

        @InjectModel(Blog.name)
        private readonly blogModel: Model<Blog>,

        private readonly shopifyService: ShopifyService,

        private readonly aiService: AIService,
        private readonly imageService: ImageService,
    ) { }

    async generate(
        integrationId: string,
        dto: GenerateBlogDto,
    ) {
        const exist = await this.blogModel.findOne({
            integrationId,
            topic: dto.topic,
        });
        if (exist) {
            return {
                success: true,
                topic: dto.topic,
                generatedAt: new Date(),
                blog: exist,
            };
        }
        const intelligence =
            await this.intelligenceModel.findOne({
                integrationId,
            });

        if (!intelligence) {
            throw new NotFoundException(
                'Store analysis not found. Please analyze your store first.',
            );
        }
        console.log('intelligence', intelligence);
        let products: any[] = [];

        if (
            dto.products &&
            dto.products.length > 0
        ) {
            products =
                await this.shopifyService.getProductsByIds(
                    integrationId,
                    dto.products,
                );
        }
        const prompt =
            this.buildPrompt(
                intelligence,
                dto.topic,
                products,
            );
        console.log(prompt);
        const response =
            await this.aiService.generate({
                prompt,
            });
        const blog =
            this.parseAIJson(
                response.text,
            );
        console.log('blog', blog);


        const savedBlog =
            await this.blogModel.create({
                integrationId,

                topic: dto.topic,

                title: blog.title,

                slug: blog.slug,

                metaTitle: blog.metaTitle,

                metaDescription:
                    blog.metaDescription,

                excerpt: blog.excerpt,

                heroImagePrompt:
                    blog.heroImagePrompt,

                estimatedReadingTime:
                    blog.estimatedReadingTime,

                keywords: blog.keywords,

                content: blog.content,
            });
        console.log('savedBlog', savedBlog);
        // const updatedBlog =
        // await this.imageService.generateHeroImage(
        // savedBlog._id.toString(),
        // );
        // console.log('updatedBlog', updatedBlog);
        return {
            success: true,

            topic: dto.topic,

            generatedAt:
                new Date(),

            blog: savedBlog,
        };
    }

    private buildPrompt(
        intelligence: any,
        topic: string,
        products: any[],
    ): string {
        return `
You are a world-class Ecommerce SEO Content Writer and Content Marketing Expert.

Your job is to write a premium quality blog for a Shopify ecommerce store.

==============================
STORE INTELLIGENCE
==============================

Business Summary:
${intelligence.businessSummary}

Business Niche:
${intelligence.niche}

Brand Voice:
${intelligence.brandVoice}

Short Tail Keywords:
${JSON.stringify(
            intelligence.shortTailKeywords,
            null,
            2,
        )}

Long Tail Keywords:
${JSON.stringify(
            intelligence.longTailKeywords,
            null,
            2,
        )}

SEO Suggestions:
${JSON.stringify(
            intelligence.seoSuggestions,
            null,
            2,
        )}

==============================
BLOG REQUEST
==============================

Topic

${topic}

==============================
PRODUCTS
==============================

${products.length > 0
                ? JSON.stringify(products, null, 2)
                : 'No products selected.'}

==============================
WRITING REQUIREMENTS
==============================

• Write between 1500 and 2000 words.

• Use excellent SEO.

• Write naturally.

• Never keyword stuff.

• Make the article helpful.

• Human sounding.

• Professional.

• Include engaging introduction.

• Include conclusion.

• Use transition words.

• Use emotional language where appropriate.

• Use active voice.

• Keep paragraphs short.

• Every heading should provide value.

• Add FAQs.

• Include CTA.

• Use Markdown formatting.

• If products are provided, naturally recommend them.

• Mention every provided product only where relevant.

• Include product links.

• Never sound like an advertisement.

==============================
IMAGE
==============================

Generate ONE professional hero image prompt suitable for AI image generation.

Describe:

- composition
- colors
- lighting
- camera angle
- mood
- realism
- ecommerce style

==============================
CONTENT FORMAT
==============================

The blog content MUST be returned as VALID HTML.

Use proper HTML tags only.

Allowed tags:

<h1>
<h2>
<h3>
<h4>
<p>
<strong>
<em>
<ul>
<ol>
<li>
<blockquote>
<table>
<thead>
<tbody>
<tr>
<th>
<td>
<a>
<br>

Rules:

• The article MUST start with a single <h1>.
• Use <h2> for major sections.
• Use <h3> where necessary.
• Every paragraph must be wrapped inside <p>.
• Use <strong> to highlight important keywords naturally.
• Use <em> where appropriate.
• Use <ul> or <ol> whenever listing items.
• Use tables where comparison makes sense.
• Product links must use proper <a href=""> tags.
• Return clean semantic HTML only.
• Do NOT include <html>, <head>, or <body>.
• Do NOT wrap HTML inside markdown code blocks.
==============================
RETURN ONLY VALID JSON
==============================

{
  "title":"",
  "slug":"",
  "metaTitle":"",
  "metaDescription":"",
  "excerpt":"",
  "heroImagePrompt":"",
  "estimatedReadingTime":"",
  "keywords":[
    ""
  ],
  "content": "<h1>...</h1><p>...</p><h2>...</h2><p>...</p><ul><li>...</li></ul><table><thead><tr><th>...</th></tr></thead><tbody><tr><td>...</td></tr></tbody></table>",
}

Do not wrap JSON inside markdown.

Return ONLY JSON.
`;
    }

    private parseAIJson(
        text: string,
    ) {
        try {
            const cleaned = text
                .replace(/```json/g, '')
                .replace(/```/g, '')
                .trim();

            return JSON.parse(cleaned);
        } catch (error) {
            console.error(
                'Invalid AI Response:',
                text,
            );

            throw new Error(
                'AI returned invalid JSON.',
            );
        }
    }


    /**
     * Generate Campaign Blog
     */
    async generateCampaign(
        integrationId: string,
        dto: GenerateCampaignBlogDto,
    ) {
        /**
         * Get Store Intelligence
         */
        const intelligence =
            await this.intelligenceModel.findOne({
                integrationId,
            });

        if (!intelligence) {
            throw new NotFoundException(
                'Store analysis not found. Please analyze your store first.',
            );
        }

        /**
         * Selected Collections
         */
        let collections: any[] = [];

        if (
            dto.collections &&
            dto.collections.length > 0
        ) {
            collections =
                await this.shopifyService.getCollectionsByIds(
                    integrationId,
                    dto.collections,
                );
        }

        /**
         * Selected Products
         */
        let products: any[] = [];

        if (
            dto.products &&
            dto.products.length > 0
        ) {
            products =
                await this.shopifyService.getProductsByIds(
                    integrationId,
                    dto.products,
                );
        }

        /**
         * Build AI Prompt
         */
        const prompt =
            this.buildCampaignPrompt({
                intelligence,

                collections,

                products,

                competitorUrl:
                    dto.competitorUrl,

                calendar: dto.calendar,

                keywords:
                    dto.keywords,
            });

        /**
         * Generate Blog
         */
        const response =
            await this.aiService.generate({
                prompt,
            });
        console.log('Returning response to frontend...', response);
        /**
         * Parse Blog
         */
        const blog =
            this.parseAIJson(
                response.text,
            );
        console.log('Returning response blog to frontend...', blog);

        const savedBlog =
            await this.blogModel.create({
                integrationId,

                topic: blog.title,

                title: blog.title,

                slug: blog.slug,

                metaTitle: blog.metaTitle,

                metaDescription:
                    blog.metaDescription,

                excerpt: blog.excerpt,

                heroImagePrompt:
                    blog.heroImagePrompt,

                estimatedReadingTime:
                    blog.estimatedReadingTime,

                keywords: blog.keywords,

                content: blog.content,
            });

        //   const updatedBlog =
        // await this.imageService.generateHeroImage(
        // savedBlog._id.toString(),
        // );

        return {
            success: true,

            type: 'campaign',

            topic: blog.title,

            generatedAt:
                new Date(),

            blog: savedBlog,
        };
    }

    private buildCampaignPrompt(data: {
        intelligence: any;


        collections: any[];

        products: any[];

        competitorUrl: string;

        calendar: any;

        keywords?: any;
    }): string {
        return `
You are a World-Class Ecommerce SEO Expert, Senior Copywriter, Content Strategist, Marketing Expert and Shopify Blog Writer.

Your task is to generate a PREMIUM quality blog that can rank on Google, provide genuine value to readers, and naturally promote the merchant's products and collections where relevant.

====================================================
STORE INTELLIGENCE
====================================================

Business Summary
${data.intelligence.businessSummary}

Business Niche
${data.intelligence.niche}

Customer Pain Points

Content Pillars

${JSON.stringify(
            data.intelligence.contentPillars,
            null,
            2,
        )}

SEO Suggestions

${JSON.stringify(
            data.intelligence.seoSuggestions,
            null,
            2,
        )}

Business Keywords

Short Tail

${JSON.stringify(
            data.intelligence.shortTailKeywords,
            null,
            2,
        )}

Long Tail

${JSON.stringify(
            data.intelligence.longTailKeywords,
            null,
            2,
        )}

====================================================
BLOG REQUEST
====================================================

Topic

make topic according to the SEASON/ EVENT selected 

====================================================
SEASON / EVENT
====================================================

${JSON.stringify(
            data.calendar,
            null,
            2,
        )}

Generate the content around this event naturally.

Mention seasonal buying behaviour where appropriate.

====================================================
COMPETITOR
====================================================

Competitor Website

${data.competitorUrl}

Use this competitor ONLY as inspiration.

Do NOT copy their content.

Do NOT mention the competitor unless absolutely necessary.

====================================================
SELECTED COLLECTIONS
====================================================

${data.collections.length
                ? JSON.stringify(
                    data.collections,
                    null,
                    2,
                )
                : 'No collections selected.'
            }

====================================================
SELECTED PRODUCTS
====================================================

${data.products.length
                ? JSON.stringify(
                    data.products,
                    null,
                    2,
                )
                : 'No products selected.'
            }

====================================================
EXTRA KEYWORDS
====================================================

Short Tail

${JSON.stringify(
                data.keywords?.shortTail ?? [],
                null,
                2,
            )
            }

Long Tail

${JSON.stringify(
                data.keywords?.longTail ?? [],
                null,
                2,
            )
            }

==============================
WRITING REQUIREMENTS
==============================

• Write between 1500 and 2000 words.

• Use excellent SEO.

• Write naturally.

• Never keyword stuff.

• Make the article helpful.

• Human sounding.

• Professional.

• Include engaging introduction.

• Include conclusion.

• Use transition words.

• Use emotional language where appropriate.

• Use active voice.

• Keep paragraphs short.

• Every heading should provide value.

• Add FAQs.

• Include CTA.

• Use Markdown formatting.

• If products are provided, naturally recommend them.

• Mention every provided product only where relevant.

• Include product links.

• Never sound like an advertisement.

==============================
IMAGE
==============================

Generate ONE professional hero image prompt suitable for AI image generation.

Describe:

- composition
- colors
- lighting
- camera angle
- mood
- realism
- ecommerce style

==============================
CONTENT FORMAT
==============================

The blog content MUST be returned as VALID HTML.

Use proper HTML tags only.

Allowed tags:

<h1>
<h2>
<h3>
<h4>
<p>
<strong>
<em>
<ul>
<ol>
<li>
<blockquote>
<table>
<thead>
<tbody>
<tr>
<th>
<td>
<a>
<br>

Rules:

• The article MUST start with a single <h1>.
• Use <h2> for major sections.
• Use <h3> where necessary.
• Every paragraph must be wrapped inside <p>.
• Use <strong> to highlight important keywords naturally.
• Use <em> where appropriate.
• Use <ul> or <ol> whenever listing items.
• Use tables where comparison makes sense.
• Product links must use proper <a href=""> tags.
• Return clean semantic HTML only.
• Do NOT include <html>, <head>, or <body>.
• Do NOT wrap HTML inside markdown code blocks.
==============================
RETURN ONLY VALID JSON
==============================

{
  "title":"",
  "slug":"",
  "metaTitle":"",
  "metaDescription":"",
  "excerpt":"",
  "heroImagePrompt":"",
  "estimatedReadingTime":"",
  "keywords":[
    ""
  ],
  "content": "<h1>...</h1><p>...</p><h2>...</h2><p>...</p><ul><li>...</li></ul><table><thead><tr><th>...</th></tr></thead><tbody><tr><td>...</td></tr></tbody></table>",
}

Do not wrap JSON inside markdown.

Return ONLY JSON.
`;
    }


}