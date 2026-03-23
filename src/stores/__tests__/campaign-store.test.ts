import { describe, it, expect, beforeEach } from 'vitest';
import { useCampaignStore } from '../campaign-store';
import type { Country, Package, Creator } from '@/types';

const COUNTRY_TH: Country = {
  id: 1, name: 'Thailand', flag: '🇹🇭', creatorsAvail: 1500,
  avgEyeball: null, avgCPE: null, foodBevEng: null, beautyEng: null,
  snackTrend: null, platforms: [], cats: [], estReach: null, estOrders: null, isActive: true,
};

const COUNTRY_SG: Country = {
  id: 99, name: 'Singapore', flag: '🇸🇬', creatorsAvail: 800,
  avgEyeball: null, avgCPE: null, foodBevEng: null, beautyEng: null,
  snackTrend: null, platforms: [], cats: [], estReach: null, estOrders: null, isActive: true,
};

const PKG_STARTER: Package = {
  id: 1, name: 'Starter', badge: null,
  numCreators: 5, pricePerCreator: 2500, discountPct: 0,
  estReach: null, estEngagement: null,
};

const PKG_POPULAR: Package = {
  id: 2, name: 'Popular', badge: 'แนะนำ',
  numCreators: 10, pricePerCreator: 3500, discountPct: 5,
  estReach: null, estEngagement: null,
};

const CREATOR_1: Creator = {
  id: 'creator-1', name: 'Creator 1', niche: 'Food', engagement: '5%',
  reach: '100K', avatar: '👩', countryFlag: '🇹🇭', isBackup: false,
};

const CREATOR_2: Creator = {
  id: 'creator-2', name: 'Creator 2', niche: 'Beauty', engagement: '7%',
  reach: '200K', avatar: '👨', countryFlag: '🇻🇳', isBackup: false,
};

describe('campaign-store', () => {
  beforeEach(() => {
    useCampaignStore.getState().reset();
  });

  it('has correct initial state', () => {
    const state = useCampaignStore.getState();
    expect(state.countryData).toBeNull();
    expect(state.promotionType).toBeNull();
    expect(state.productData).toBeNull();
    expect(state.packageData).toBeNull();
    expect(state.selectedCreatorsData).toEqual([]);
  });

  it('setCountry sets countryData', () => {
    useCampaignStore.getState().setCountry(COUNTRY_TH);
    expect(useCampaignStore.getState().countryData).toEqual(COUNTRY_TH);
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

  it('reset returns to initial state after mutations', () => {
    useCampaignStore.getState().setCountry(COUNTRY_SG);
    useCampaignStore.getState().setPackage(PKG_POPULAR);
    useCampaignStore.getState().setCreators([CREATOR_1, CREATOR_2]);

    useCampaignStore.getState().reset();

    const state = useCampaignStore.getState();
    expect(state.countryData).toBeNull();
    expect(state.promotionType).toBeNull();
    expect(state.productData).toBeNull();
    expect(state.packageData).toBeNull();
    expect(state.selectedCreatorsData).toEqual([]);
  });
});
