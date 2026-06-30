import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
  timestamps: true,
})
export class User {
  // Shopify Owner

  @Prop()
  shopDomain: string;

  @Prop()
  shopifyUserId: string;

  @Prop()
  integrationId: string;

  // Admin Login

  @Prop({
    unique: true,
    sparse: true,
  })
  email?: string;

  @Prop()
  password?: string;

  // Common

  @Prop({
    enum: ['admin', 'owner'],
    default: 'owner',
  })
  role: string;

  @Prop({
    default: true,
  })
  isActive: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);