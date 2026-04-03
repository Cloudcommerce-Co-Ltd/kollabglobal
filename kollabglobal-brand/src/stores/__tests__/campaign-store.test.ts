import { describe, it, expect, beforeEach } from 'vitest';
import { useCampaignStore } from '../campaign-store';
import type { Country, Package, CreatorWithPackageInfo } from '@/types';

const COUNTRY_TH: Country = {
  id: 1, name: 'Thailand', countryCode: 'TH', region: 'asia', languageCode: 'th', languageName: 'Thai',
  creatorsAvail: 1500, avgEyeball: null, avgCPE: null, foodBevEng: null, beautyEng: null, snackTrend: null,
  platforms: [], cats: [], estReach: null, estOrders: null, isActive: true,
};

const COUNTRY_SG: Country = {
  id: 99, name: 'Singapore', countryCode: 'SG', region: 'global', languageCode: 'en', languageName: 'English',
  creatorsAvail: 800, avgEyeball: null, avgCPE: null, foodBevEng: null, beautyEng: null, snackTrend: null,
  platforms: [], cats: [], estReach: null, estOrders: null, isActive: true,
};

const PKG_STARTER: Package = {
  id: 1, name: 'Starter', tagline: 'Starter package', badge: null,
  numCreators: 5, price: 12500, platforms: [], deliverables: [], cpmLabel: '', cpmSavings: '',
  estReach: null, estEngagement: null,
};

const PKG_POPULAR: Package = {
  id: 2, name: 'Popular', tagline: 'Popular package', badge: 'แนะนำ',
  numCreators: 10, price: 33250, platforms: [], deliverables: [], cpmLabel: '', cpmSavings: '',
  estReach: null, estEngagement: null,
};

const CREATOR_1: CreatorWithPackageInfo = {
  id: 'creator-1', name: 'Creator 1', niche: 'Food', engagement: '5%',
  reach: '100K', avatar: '👩', countryCode: 'TH', countryId: 1, isBackup: false, sortOrder: 0,
  platform: null, socialHandle: null, portfolioUrl: null,
};

const CREATOR_2: CreatorWithPackageInfo = {
  id: 'creator-2', name: 'Creator 2', niche: 'Beauty', engagement: '7%',
  reach: '200K', avatar: '👨', countryCode: 'VN', countryId: 2, isBackup: false, sortOrder: 1,
  platform: null, socialHandle: null, portfolioUrl: null,
};

describe('campaign-store', () => {
  beforeEach(() => {
    useCampaignStore.getState().reset();
  });

  it('has correct initial state', () => {
    const state = useCampaignStore.getState();
    expect(state.status).toBe('idle');
    expect(state.countryData).toBeNull();
    expect(state.promotionType).toBeNull();
    expect(state.productData).toBeNull();
    expect(state.packageData).toBeNull();
    expect(state.selectedCreatorsData).toEqual([]);
    expect(state.chargeId).toBeNull();
    expect(state.campaignId).toBeNull();
    expect(state.qrCodeUrl).toBeNull();
  });

  it('setCountry sets countryData and status to draft', () => {
    useCampaignStore.getState().setCountry(COUNTRY_TH);
    const state = useCampaignStore.getState();
    expect(state.countryData).toEqual(COUNTRY_TH);
    expect(state.status).toBe('draft');
  });

  it('setPromotionType sets PRODUCT', () => {
    useCampaignStore.getState().setPromotionType('PRODUCT');
    expect(useCampaignStore.getState().promotionType).toBe('PRODUCT');
  });

  it('setPromotionType sets SERVICE', () => {
    useCampaignStore.getState().setPromotionType('SERVICE');
    expect(useCampaignStore.getState().promotionType).toBe('SERVICE');
  });

  it('setProduct sets full ProductData object', () => {
    const product = {
      brandName: 'Test Brand',
      productName: 'Test Product',
      category: 'Beauty',
      description: 'A test product',
      sellingPoints: 'Good quality',
      url: 'https://example.com',
      imageUrl: 'https://example.com/img.png',
      isService: false,
    };
    useCampaignStore.getState().setProduct(product);
    expect(useCampaignStore.getState().productData).toEqual(product);
  });

  it('setPackage sets packageData', () => {
    useCampaignStore.getState().setPackage(PKG_STARTER);
    expect(useCampaignStore.getState().packageData).toEqual(PKG_STARTER);
  });

  it('setCreators sets selectedCreatorsData array', () => {
    useCampaignStore.getState().setCreators([CREATOR_1, CREATOR_2]);
    expect(useCampaignStore.getState().selectedCreatorsData).toEqual([CREATOR_1, CREATOR_2]);
  });

  it('setCheckoutData stores charge info and sets status to checkout', () => {
    useCampaignStore.getState().setCheckoutData('charge-abc', 'campaign-xyz', 'https://qr.code/img');
    const state = useCampaignStore.getState();
    expect(state.chargeId).toBe('charge-abc');
    expect(state.campaignId).toBe('campaign-xyz');
    expect(state.qrCodeUrl).toBe('https://qr.code/img');
    expect(state.status).toBe('checkout');
  });

  it('reset returns to initial state after mutations including checkout data', () => {
    useCampaignStore.getState().setCountry(COUNTRY_SG);
    useCampaignStore.getState().setPackage(PKG_POPULAR);
    useCampaignStore.getState().setCreators([CREATOR_1, CREATOR_2]);
    useCampaignStore.getState().setCheckoutData('charge-1', 'campaign-1', 'https://qr.url');

    useCampaignStore.getState().reset();

    const state = useCampaignStore.getState();
    expect(state.status).toBe('idle');
    expect(state.countryData).toBeNull();
    expect(state.promotionType).toBeNull();
    expect(state.productData).toBeNull();
    expect(state.packageData).toBeNull();
    expect(state.selectedCreatorsData).toEqual([]);
    expect(state.chargeId).toBeNull();
    expect(state.campaignId).toBeNull();
    expect(state.qrCodeUrl).toBeNull();
  });

  it('clearCheckoutData clears charge info and resets status to draft', () => {
    useCampaignStore.getState().setCheckoutData('charge-abc', 'campaign-xyz', 'https://qr.code/img');
    useCampaignStore.getState().clearCheckoutData();
    const state = useCampaignStore.getState();
    expect(state.chargeId).toBeNull();
    expect(state.campaignId).toBeNull();
    expect(state.qrCodeUrl).toBeNull();
    expect(state.status).toBe('draft');
  });
});

describe('campaign-store — checkout data invalidation', () => {
  beforeEach(() => {
    useCampaignStore.getState().reset();
  });

  it('setCountry clears checkout data when country changes and chargeId is set', () => {
    useCampaignStore.getState().setCountry(COUNTRY_TH);
    useCampaignStore.getState().setCheckoutData('charge-1', 'campaign-1', 'https://qr.url');

    useCampaignStore.getState().setCountry(COUNTRY_SG);

    const state = useCampaignStore.getState();
    expect(state.chargeId).toBeNull();
    expect(state.qrCodeUrl).toBeNull();
    expect(state.countryData).toEqual(COUNTRY_SG);
  });

  it('setCountry keeps checkout data when same country is set again', () => {
    useCampaignStore.getState().setCountry(COUNTRY_TH);
    useCampaignStore.getState().setCheckoutData('charge-1', 'campaign-1', 'https://qr.url');

    useCampaignStore.getState().setCountry(COUNTRY_TH);

    expect(useCampaignStore.getState().chargeId).toBe('charge-1');
  });

  it('setProduct clears checkout data when chargeId is set', () => {
    useCampaignStore.getState().setCheckoutData('charge-1', 'campaign-1', 'https://qr.url');
    useCampaignStore.getState().setProduct({
      brandName: 'B', productName: 'P', category: 'Food',
      description: '', sellingPoints: '', url: '', imageUrl: '', isService: false,
    });

    const state = useCampaignStore.getState();
    expect(state.chargeId).toBeNull();
    expect(state.qrCodeUrl).toBeNull();
  });

  it('setPackage clears checkout data when package changes and chargeId is set', () => {
    useCampaignStore.getState().setPackage(PKG_STARTER);
    useCampaignStore.getState().setCheckoutData('charge-1', 'campaign-1', 'https://qr.url');

    useCampaignStore.getState().setPackage(PKG_POPULAR);

    const state = useCampaignStore.getState();
    expect(state.chargeId).toBeNull();
    expect(state.packageData).toEqual(PKG_POPULAR);
  });

  it('setPackage keeps checkout data when same package is set again', () => {
    useCampaignStore.getState().setPackage(PKG_STARTER);
    useCampaignStore.getState().setCheckoutData('charge-1', 'campaign-1', 'https://qr.url');

    useCampaignStore.getState().setPackage(PKG_STARTER);

    expect(useCampaignStore.getState().chargeId).toBe('charge-1');
  });

  it('setCreators clears checkout data when creator IDs change and chargeId is set', () => {
    useCampaignStore.getState().setCreators([CREATOR_1]);
    useCampaignStore.getState().setCheckoutData('charge-1', 'campaign-1', 'https://qr.url');

    useCampaignStore.getState().setCreators([CREATOR_1, CREATOR_2]);

    const state = useCampaignStore.getState();
    expect(state.chargeId).toBeNull();
  });

  it('setCreators keeps checkout data when same creator IDs are set', () => {
    useCampaignStore.getState().setCreators([CREATOR_1, CREATOR_2]);
    useCampaignStore.getState().setCheckoutData('charge-1', 'campaign-1', 'https://qr.url');

    useCampaignStore.getState().setCreators([CREATOR_2, CREATOR_1]);

    expect(useCampaignStore.getState().chargeId).toBe('charge-1');
  });

  it('setCreators does not clear checkout data when empty array is set', () => {
    useCampaignStore.getState().setCreators([CREATOR_1]);
    useCampaignStore.getState().setCheckoutData('charge-1', 'campaign-1', 'https://qr.url');

    useCampaignStore.getState().setCreators([]);

    expect(useCampaignStore.getState().chargeId).toBe('charge-1');
  });
});
