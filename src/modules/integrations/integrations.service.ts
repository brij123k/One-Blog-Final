import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import axios from 'axios';
import {
  Integration,
  IntegrationDocument,
} from './schema/integrations.schema';

import { CreateIntegrationDto } from './dto/create-integration.dto';
import { UpdateIntegrationDto } from './dto/update-integration.dto';
import { PlansService } from '../plans/plans.service';
@Injectable()
export class IntegrationsService {
  constructor(
    @InjectModel(Integration.name)
    private integrationModel: Model<IntegrationDocument>,
    private plansService:PlansService,
  ) {}

  async installShopify(shop: string) {
    const apiKey = process.env.SHOPIFY_API_KEY;
    const scopes = process.env.SHOPIFY_SCOPES;
    const redirectUri =
      process.env.SHOPIFY_CALLBACK_URL;

    const installUrl =
      `https://${shop}/admin/oauth/authorize` +
      `?client_id=${apiKey}` +
      `&scope=${scopes}` +
      `&redirect_uri=${redirectUri}`;

    return {
      installUrl,
    };
  }

async callback(
  shop: string,
  code: string,
) {
  const response = await axios.post(
    `https://${shop}/admin/oauth/access_token`,
    {
      client_id:
        process.env.SHOPIFY_API_KEY,
      client_secret:
        process.env.SHOPIFY_API_SECRET,
      code,
    },
  );

  const accessToken =
    response.data.access_token;
    this.saveShopifyStore(shop,accessToken)
  return {
    accessToken,
  };
}

async syncShopifyStore(
  shop: string,
  accessToken: string,
) {
  try {
    const response = await axios.get(
      `https://${shop}/admin/api/2025-01/shop.json`,
      {
        headers: {
          'X-Shopify-Access-Token': accessToken,
        },
      },
    );

    const store = response.data.shop;

    return store;
  } catch (error:any) {
    console.error(error.response?.data);

    throw new Error(
      'Unable to fetch Shopify store',
    );
  }
}

async saveShopifyStore(
  shop: string,
  accessToken: string,
) {
  const store =
    await this.syncShopifyStore(
      shop,
      accessToken,
    );
    const freePlan =
  await this.plansService.findFreePlan();
  const existing =
    await this.integrationModel.findOne({
      storeUrl: shop,
    });

  if (existing) {
    existing.storeName = store.name;
    existing.shopId = String(store.id);
    existing.email = store.email;
    existing.country = store.country_name;
    existing.currency = store.currency;
    existing.planId =freePlan?._id;
    existing.domain = store.domain;
    existing.myshopifyDomain =
      store.myshopify_domain;
    existing.accessToken =
      accessToken;

    await existing.save();

    return existing;
  }

  return this.integrationModel.create({
    platform: 'shopify',

    storeName: store.name,

    storeUrl: shop,

    shopId: String(store.id),

    email: store.email,

    country: store.country_name,

    currency: store.currency,

    planId:store.planId,

    domain: store.domain,

    myshopifyDomain:
      store.myshopify_domain,

    accessToken,

    isActive: true,
  });
}


  async create(
    createIntegrationDto: CreateIntegrationDto,
  ) {
    return this.integrationModel.create(
      createIntegrationDto,
    );
  }

  async findAll() {
    return this.integrationModel.find().sort({
      createdAt: -1,
    });
  }

  async findOne(id: string) {
    const integration =
      await this.integrationModel.findById(id);

    if (!integration) {
      throw new NotFoundException(
        'Integration not found',
      );
    }

    return integration;
  }

  async update(
    id: string,
    updateIntegrationDto: UpdateIntegrationDto,
  ) {
    const integration =
      await this.integrationModel.findByIdAndUpdate(
        id,
        updateIntegrationDto,
        {
          new: true,
        },
      );

    if (!integration) {
      throw new NotFoundException(
        'Integration not found',
      );
    }

    return integration;
  }

  async remove(id: string) {
    const integration =
      await this.integrationModel.findByIdAndDelete(
        id,
      );

    if (!integration) {
      throw new NotFoundException(
        'Integration not found',
      );
    }

    return {
      message: 'Integration removed successfully',
    };
  }

  async findByStoreUrl(storeUrl: string) {
    return this.integrationModel.findOne({
      storeUrl,
    });
  }
}