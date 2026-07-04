import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import axios from 'axios';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as fs from 'fs/promises';
import * as path from 'path';
import FormData from 'form-data';
import { ShopifyApiService } from './services/shopify-api.service';

import {
  Integration,
  IntegrationDocument,
} from '../integrations/schema/integrations.schema';

@Injectable()
export class ShopifyService {
  constructor(
    @InjectModel(Integration.name)
    private readonly integrationModel: Model<IntegrationDocument>,

    private readonly shopifyApi: ShopifyApiService,
  ) { }

  private async getIntegration(
    integrationId: string,
  ) {
    const integration =
      await this.integrationModel.findById(
        integrationId,
      );

    if (!integration) {
      throw new NotFoundException(
        'Store not found',
      );
    }

    return integration;
  }

  private async graphqlRequest(
    storeUrl: string,
    accessToken: string,
    query: string,
    variables?: Record<string, any>,
  ) {
    try {
      const endpoint = `https://${storeUrl}/admin/api/2025-01/graphql.json`;

      const { data } = await axios.post(
        endpoint,
        {
          query,
          variables,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': accessToken,
          },
        },
      );

      if (data.errors) {
        throw new Error(
          JSON.stringify(data.errors),
        );
      }

      if (data.data === null) {
        throw new Error(
          'Shopify returned null data.',
        );
      }

      return data.data;
    } catch (error: any) {
      console.error(
        'Shopify GraphQL Error:',
        error.response?.data || error.message,
      );

      throw error;
    }
  }
  private async stagedUploadsCreate(
    integration: IntegrationDocument,
    fileName: string,
    mimeType: string,
    fileSize: number,
  ) {
    const mutation = `
    mutation stagedUploadsCreate(
      $input: [StagedUploadInput!]!
    ) {
      stagedUploadsCreate(
        input: $input
      ) {
        stagedTargets {
          url
          resourceUrl

          parameters {
            name
            value
          }
        }

        userErrors {
          field
          message
        }
      }
    }
  `;

    const variables = {
      input: [
        {
          filename: fileName,

          mimeType,

          resource: "FILE",

          fileSize: fileSize.toString(),

          httpMethod: "POST",
        },
      ],
    };

    const response =
      await this.graphqlRequest(
        integration.storeUrl,
        integration.accessToken,
        mutation,
        variables,
      );

    const errors =
      response.stagedUploadsCreate.userErrors;

    if (errors.length) {
      throw new Error(
        errors
          .map((e: any) => e.message)
          .join(", "),
      );
    }

    return response.stagedUploadsCreate.stagedTargets[0];
  }
  private async uploadToStagedTarget(
    stagedTarget: any,
    fileBuffer: Buffer,
    fileName: string,
  ) {
    const form =
      new FormData();

    /**
     * Shopify Parameters
     */
    for (const parameter of stagedTarget.parameters) {
      form.append(
        parameter.name,
        parameter.value,
      );
    }

    /**
     * File
     */
    form.append(
      "file",
      fileBuffer,
      {
        filename: fileName,
      },
    );

    const response =
      await axios.post(
        stagedTarget.url,
        form,
        {
          headers: form.getHeaders(),

          maxBodyLength: Infinity,

          maxContentLength: Infinity,
        },
      );

    if (
      response.status !== 201 &&
      response.status !== 204
    ) {
      throw new Error(
        "Failed to upload image to Shopify staged upload.",
      );
    }

    return stagedTarget.resourceUrl;
  }
  private async wait(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  private async getMediaImageUrl(
    integration: IntegrationDocument,
    mediaId: string,
  ): Promise<string> {

    const query = `
    query GetMedia($id: ID!) {
      node(id: $id) {
        ... on MediaImage {
          id
          fileStatus

          image {
            url
          }
        }
      }
    }
  `;

    /**
     * Retry up to 10 times
     */
    for (let i = 0; i < 10; i++) {

      const response =
        await this.graphqlRequest(
          integration.storeUrl,
          integration.accessToken,
          query,
          {
            id: mediaId,
          },
        );

      const media = response.node;

      console.log(media);

      if (
        media?.fileStatus === 'READY' &&
        media?.image?.url
      ) {
        return media.image.url;
      }

      await this.wait(1000);
    }

    throw new Error(
      'Shopify image processing timed out.',
    );
  }
  private async fileCreate(
    integration: IntegrationDocument,
    resourceUrl: string,
  ) {
    const mutation = `
    mutation fileCreate(
      $files: [FileCreateInput!]!
    ) {
      fileCreate(
        files: $files
      ) {
        files {

          ... on MediaImage {

            id

            image {
              url
            }

          }

        }

        userErrors {
          field
          message
        }
      }
    }
  `;

    const response =
      await this.graphqlRequest(
        integration.storeUrl,
        integration.accessToken,
        mutation,
        {
          files: [
            {
              contentType:
                "IMAGE",

              originalSource:
                resourceUrl,
            },
          ],
        },
      );
    console.log(JSON.stringify(response, null, 2));
    const errors =
      response.fileCreate.userErrors;

    if (errors.length) {
      throw new Error(
        errors
          .map((e: any) => e.message)
          .join(", "),
      );
    }

    const media =
      response.fileCreate.files?.[0];

    if (!media?.id) {
      throw new Error(
        'Shopify did not return media id.',
      );
    }

    return this.getMediaImageUrl(
      integration,
      media.id,
    );
  }
  private async uploadHeroImage(
    integration: IntegrationDocument,
    localPath: string,
  ) {
    /**
     * Read File
     */
    const buffer =
      await fs.readFile(
        localPath,
      );

    /**
     * File Info
     */
    const stat =
      await fs.stat(
        localPath,
      );

    const fileName =
      path.basename(
        localPath,
      );

    const extension =
      path
        .extname(
          localPath,
        )
        .replace(".", "");

    const mimeType =
      `image/${extension}`;

    /**
     * Stage Upload
     */
    const stagedTarget =
      await this.stagedUploadsCreate(
        integration,

        fileName,

        mimeType,

        stat.size,
      );

    /**
     * Upload Binary
     */
    const resourceUrl =
      await this.uploadToStagedTarget(
        stagedTarget,

        buffer,

        fileName,
      );

    /**
     * Register File
     */
    return this.fileCreate(
      integration,
      resourceUrl,
    );
  }
  buildStoreContext(
    shop: any,
    collections: any[],
    products: any[],
  ) {
    return {
      shop,

      collections,

      totalCollections:
        collections.length,

      totalProducts:
        products.length,

      productTypes: [
        ...new Set(
          products
            .map(
              (p) => p.productType,
            )
            .filter(Boolean),
        ),
      ],

      vendors: [
        ...new Set(
          products
            .map(
              (p) => p.vendor,
            )
            .filter(Boolean),
        ),
      ],

      tags: [
        ...new Set(
          products.flatMap(
            (p) => p.tags ?? [],
          ),
        ),
      ],
    };
  }

  private async getOrCreateBlog(
    integration: IntegrationDocument,
  ) {
    const query = `
    query {
      blogs(first: 20) {
        nodes {
          id
          title
          handle
        }
      }
    }
  `;

    const response =
      await this.graphqlRequest(
        integration.storeUrl,
        integration.accessToken,
        query,
      );

    let blog =
      response.blogs.nodes.find(
        (item: any) =>
          item.title.toLowerCase() ===
          'news',
      );

    if (blog) {
      return blog;
    }

    return this.createBlog(
      integration,
    );
  }

  private async createBlog(
    integration: IntegrationDocument,
  ) {
    const mutation = `
    mutation BlogCreate(
      $blog: BlogCreateInput!
    ) {
      blogCreate(
        blog: $blog
      ) {
        blog {
          id
          title
          handle
        }

        userErrors {
          field
          message
        }
      }
    }
  `;

    const response =
      await this.graphqlRequest(
        integration.storeUrl,
        integration.accessToken,
        mutation,
        {
          blog: {
            title: 'AI Blog',
          },
        },
      );

    if (
      response.blogCreate
        .userErrors.length
    ) {
      throw new Error(
        response.blogCreate.userErrors
          .map(
            (e: any) =>
              e.message,
          )
          .join(', '),
      );
    }

    return response.blogCreate.blog;
  }

  async searchCollections(
    integrationId: string,
    search = '',
    first = 20,
  ) {
    const integration =
      await this.getIntegration(
        integrationId,
      );

    const query = `
      query SearchCollections(
        $first: Int!,
        $query: String!
      ) {
        collections(
          first: $first,
          query: $query
        ) {
          nodes {
            id
            title
            handle

            image {
              url
            }

            productsCount {
              count
            }
          }
        }
      }
    `;

    const variables = {
      first,

      query: search
        ? `title:*${search}*`
        : '',
    };

    const response =
      await this.shopifyApi.graphQL(
        integration.storeUrl,
        integration.accessToken,
        query,
        variables,
      );

    return {
      success: true,

      collections:
        response.collections.nodes.map(
          (collection: any) => ({
            id: collection.id,

            title: collection.title,

            handle: collection.handle,

            image:
              collection.image?.url ??
              null,

            productsCount:
              collection.productsCount
                ?.count ?? 0,
          }),
        ),
    };
  }

  async searchProducts(
    integrationId: string,
    search: string,
    limit = 10,
  ) {
    if (!search || search.trim() === '') {
      return [];
    }

    const integration =
      await this.integrationModel.findById(integrationId);

    if (!integration) {
      throw new NotFoundException('Store not found');
    }

    const query = `
    query SearchProducts($query: String!, $first: Int!) {
      products(
        first: $first,
        query: $query
      ) {
        edges {
          node {
            id
            title
            handle
            status

            featuredImage {
              url
            }

            priceRangeV2 {
              minVariantPrice {
                amount
                currencyCode
              }
            }
          }
        }
      }
    }
  `;

    const variables = {
      query: `title:*${search}*`,
      first: limit,
    };

    const response = await axios.post(
      `https://${integration.storeUrl}/admin/api/2025-04/graphql.json`,
      {
        query,
        variables,
      },
      {
        headers: {
          'X-Shopify-Access-Token':
            integration.accessToken,
          'Content-Type': 'application/json',
        },
      },
    );

    return response.data.data.products.edges.map(
      ({ node }) => ({
        id: node.id,
        title: node.title,
        handle: node.handle,
        status: node.status,
        image: node.featuredImage?.url ?? null,
        price:
          node.priceRangeV2.minVariantPrice.amount,
        currency:
          node.priceRangeV2.minVariantPrice.currencyCode,
      }),
    );
  }

  async getShopInfo(
    integrationId: string,
  ) {
    const integration =
      await this.integrationModel.findById(
        integrationId,
      );

    if (!integration) {
      throw new NotFoundException(
        'Integration not found',
      );
    }

    const query = `
  {
    shop {
      id
      name
      description
      primaryDomain {
        url
      }
      shipsToCountries
    }
  }
  `;

    const response =
      await this.graphqlRequest(
        integration.storeUrl,
        integration.accessToken,
        query,
      );

    return response.shop;
  }
  async getStoreCollections(
    integrationId: string,
  ) {
    const integration =
      await this.integrationModel.findById(
        integrationId,
      );

    if (!integration) {
      throw new NotFoundException("Store not found")
    }
    const query = `
  {
    collections(first:10){
      nodes{
        id
        title
        description
      }
    }
  }
  `;

    const response =
      await this.graphqlRequest(
        integration.storeUrl,
        integration.accessToken,
        query,
      );

    return response.collections.nodes;
  }

  async getStoreProducts(
    integrationId: string,
  ) {
    const integration =
      await this.integrationModel.findById(
        integrationId,
      );
    if (!integration) {
      throw new NotFoundException("Store not found")
    }
    const query = `
  {
    products(first:20){
      nodes{
        id
        title
        vendor
        productType
        tags
      }
    }
  }
  `;

    const response =
      await this.graphqlRequest(
        integration.storeUrl,
        integration.accessToken,
        query,
      );

    return response.products.nodes;
  }

  async getProductsByIds(
    integrationId: string,
    productIds: string[],
  ) {
    const integration =
      await this.getIntegration(
        integrationId,
      );

    const query = `
  query GetProducts($ids:[ID!]!){

    nodes(ids:$ids){

      ... on Product{

        id

        title

        handle

        description

        vendor

        productType

        tags

        featuredImage{
          url
        }

        priceRangeV2{
          minVariantPrice{
            amount
            currencyCode
          }
        }

      }

    }

  }
  `;

    const data =
      await this.graphqlRequest(
        integration.storeUrl,
        integration.accessToken,
        query,
        {
          ids: productIds,
        },
      );

    return data.nodes.filter(Boolean);
  }
  /**
   * Get Collections By IDs
   */
  async getCollectionsByIds(
    integrationId: string,
    collectionIds: string[],
  ) {
    const integration =
      await this.getIntegration(
        integrationId,
      );

    const query = `
  query GetCollections($ids:[ID!]!){

    nodes(ids:$ids){

      ... on Collection{

        id

        title

        handle

        description

        seo{
          title
          description
        }

        image{
          url
        }

        products(first:5){

          nodes{

            id

            title

            handle

            vendor

            productType

          }

        }

      }

    }

  }
  `;

    const data =
      await this.graphqlRequest(
        integration.storeUrl,
        integration.accessToken,
        query,
        {
          ids: collectionIds,
        },
      );

    return data.nodes.filter(Boolean);
  }

 async publishBlog(data: {
  integrationId: string;
  blog: any;
}) {
  const integration =
    await this.getIntegration(
      data.integrationId,
    );

  const shopifyBlog =
    await this.getOrCreateBlog(
      integration,
    );

  /**
   * Upload hero image only if it exists
   */
  let imageUrl: string | undefined;

  if (
    data.blog.heroImage?.localPath
  ) {
    imageUrl =
      await this.uploadHeroImage(
        integration,
        data.blog.heroImage.localPath,
      );
  }

  /**
   * Create Shopify Article
   */
  const article =
    await this.createArticle({
      integration,

      blogId: shopifyBlog.id,

      blog: data.blog,

      imageUrl,
    });

  /**
   * Save Shopify Image URL if uploaded
   */
  if (
    imageUrl &&
    data.blog.heroImage
  ) {
    data.blog.heroImage.shopifyUrl =
      imageUrl;
  }

  await data.blog.save();

  return {
    blogId:
      shopifyBlog.id,

    articleId:
      article.id,

    url: `https://${integration.storeUrl}/blogs/${shopifyBlog.handle}/${article.handle}`,

    handle:
      article.handle,

    publishedAt:
      article.publishedAt,

    imageUrl: imageUrl ?? null,
  };
}

  private async createArticle(data: {
    integration: IntegrationDocument;
    blogId: string;
    blog: any;
    imageUrl?: string;
  }) {
    const mutation = `
    mutation CreateArticle(
      $article: ArticleCreateInput!
    ) {
      articleCreate(
        article: $article
      ) {
        article {
          id
          title
          handle
          body
          summary
          tags

          author {
            name
          }

          image {
            altText
            originalSrc
          }

          publishedAt
        }

        userErrors {
          code
          field
          message
        }
      }
    }
  `;

    const bodyHtml = `
<img src="${data.imageUrl}" alt="${data.blog.title}" />

${data.blog.content}
`;

    const variables = {
      article: {
        /**
         * VERY IMPORTANT
         */
        blogId: data.blogId,

        title: data.blog.title,

        handle: data.blog.slug,

        body: bodyHtml,

        summary: data.blog.excerpt,

        isPublished: true,

        publishDate: new Date().toISOString(),

        tags: data.blog.keywords ?? [],

        author: {
          name: 'AI Writer',
        },

        image: {
          url: data.imageUrl,

          altText: data.blog.title,
        },
      },
    };

    const response =
      await this.graphqlRequest(
        data.integration.storeUrl,
        data.integration.accessToken,
        mutation,
        variables,
      );

    const errors =
      response.articleCreate.userErrors;

    if (errors.length) {
      throw new Error(
        errors
          .map((e: any) => e.message)
          .join(', '),
      );
    }

    return response.articleCreate.article;
  }
}