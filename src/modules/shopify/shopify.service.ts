import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { ShopifyApiService } from './services/shopify-api.service';

import {
  Integration,
  IntegrationDocument,
} from '../integrations/schema/integrations.schema';
import axios from 'axios';

@Injectable()
export class ShopifyService {
  constructor(
    @InjectModel(Integration.name)
    private readonly integrationModel: Model<IntegrationDocument>,

    private readonly shopifyApi: ShopifyApiService,
  ) {}

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
}