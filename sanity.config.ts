import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './sanity/schemas'
import { SalesDashboard } from './sanity/SalesDashboard'
export default defineConfig({
  name: 'elorge', title: 'Elorge Store Studio', basePath: '/studio',
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!, dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  plugins: [structureTool({ structure: (S) => S.list().title('Elorge Store').items([
    S.documentTypeListItem('lightning').title('⚡ Lightning Deals (3-5 min)'),
    S.documentTypeListItem('promo').title('⚡ Flash Sales & Promos'),
    S.documentTypeListItem('product').title('Products'),
    S.documentTypeListItem('brand').title('Sellers'),
    S.documentTypeListItem('order').title('Orders'),
    S.listItem().title('Step 1: pay sellers').child(S.documentList().title('Paid by customer, seller NOT yet paid').filter('_type=="order" && status=="paid" && count(payouts[paid!=true]) > 0')),
    S.listItem().title('Step 2: ready to collect and ship').child(S.documentList().title('Seller paid: collect the goods').filter('_type=="order" && status=="paid" && count(payouts) > 0 && count(payouts[paid!=true]) == 0')),
    S.listItem().title('All paid orders').child(S.documentList().title('Paid, not yet shipped').filter('_type=="order" && status=="paid"')),
    S.listItem().title('⚠️ Low stock').child(S.documentList().title('Low stock (10 or fewer)').filter('_type=="product" && defined(stockUnits) && stockUnits<=10')),
    S.listItem().title('⭐ Reviews to approve').child(S.documentList().title('Waiting approval').filter('_type=="review" && approved!=true')),
    S.documentTypeListItem('review').title('All reviews'),
    S.documentTypeListItem('chatMessage').title('Chat history'),
    S.documentTypeListItem('customer').title('Customers (accounts)'),
    S.documentTypeListItem('deliveryPartner').title('Delivery partners & Elorge Logistics'),
    S.listItem().title('Elorge Logistics: orders to dispatch').child(S.documentList().title('Paid, our own delivery').filter('_type=="order" && status=="paid" && logisticsKind=="own"')),
    S.documentTypeListItem('coupon').title('🏷️ Discount Codes'),
    S.documentTypeListItem('quote').title('Bulk Quote Requests'),
    S.documentTypeListItem('sellerApplication').title('Seller Applications'),
    S.documentTypeListItem('logisticsApplication').title('Logistics Applications'),
    S.divider(),
    S.listItem().title('Site Settings').child(S.document().schemaType('siteSettings').documentId('siteSettings')),
  ]) }), visionTool()],
  tools: [{ name: 'sales', title: 'Sales', component: SalesDashboard }],
  schema: { types: schemaTypes },
})
