import {
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import axios, {
  AxiosInstance,
  AxiosRequestConfig,
} from 'axios';

@Injectable()
export class ShopifyApiService {
  private createClient(
    shopDomain: string,
    accessToken: string,
  ): AxiosInstance {
    return axios.create({
      baseURL: `https://${shopDomain}/admin/api/2025-01`,
      timeout: 30000,

      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': accessToken,
      },
    });
  }

  async get(
    shopDomain: string,
    accessToken: string,
    endpoint: string,
    params?: Record<string, any>,
  ) {
    try {
      const client = this.createClient(
        shopDomain,
        accessToken,
      );

      const { data } = await client.get(endpoint, {
        params,
      });

      return data;
    } catch (error: any) {
      throw new InternalServerErrorException({
        message: 'Shopify GET request failed',
        error:
          error.response?.data ||
          error.message,
      });
    }
  }

  async post(
    shopDomain: string,
    accessToken: string,
    endpoint: string,
    body: any,
  ) {
    try {
      const client = this.createClient(
        shopDomain,
        accessToken,
      );

      const { data } = await client.post(
        endpoint,
        body,
      );

      return data;
    } catch (error: any) {
      throw new InternalServerErrorException({
        message: 'Shopify POST request failed',
        error:
          error.response?.data ||
          error.message,
      });
    }
  }

  async put(
    shopDomain: string,
    accessToken: string,
    endpoint: string,
    body: any,
  ) {
    try {
      const client = this.createClient(
        shopDomain,
        accessToken,
      );

      const { data } = await client.put(
        endpoint,
        body,
      );

      return data;
    } catch (error: any) {
      throw new InternalServerErrorException({
        message: 'Shopify PUT request failed',
        error:
          error.response?.data ||
          error.message,
      });
    }
  }

  async delete(
    shopDomain: string,
    accessToken: string,
    endpoint: string,
  ) {
    try {
      const client = this.createClient(
        shopDomain,
        accessToken,
      );

      const { data } =
        await client.delete(endpoint);

      return data;
    } catch (error: any) {
      throw new InternalServerErrorException({
        message: 'Shopify DELETE request failed',
        error:
          error.response?.data ||
          error.message,
      });
    }
  }

async graphQL(
  shopDomain: string,
  accessToken: string,
  query: string,
  variables: any = {},
) {
  try {
    const client = this.createClient(
      shopDomain,
      accessToken,
    );

    const { data } = await client.post(
      '/graphql.json',
      {
        query,
        variables,
      },
    );

    if (data.errors) {
      throw new Error(
        JSON.stringify(data.errors),
      );
    }

    return data.data;
  } catch (error: any) {
    throw new InternalServerErrorException({
      message: 'Shopify GraphQL Error',
      error:
        error.response?.data ||
        error.message,
    });
  }
}
}