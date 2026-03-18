import { describe, it, expect, beforeEach } from 'vitest';
import { useCampaignStore } from '../campaign-store';

describe('campaign-store', () => {
  beforeEach(() => {
    useCampaignStore.getState().reset();
  });

  it('has correct initial state', () => {
    const state = useCampaignStore.getState();
    expect(state.step).toBe(1);
    expect(state.countryId).toBeNull();
    expect(state.promotionType).toBeNull();
    expect(state.productData).toBeNull();
    expect(state.packageId).toBeNull();
    expect(state.selectedCreatorIds).toEqual([]);
  });

  it('setCountry sets countryId', () => {
    useCampaignStore.getState().setCountry('th');
    expect(useCampaignStore.getState().countryId).toBe('th');
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

  it('setPackage sets packageId', () => {
    useCampaignStore.getState().setPackage('pkg-starter');
    expect(useCampaignStore.getState().packageId).toBe('pkg-starter');
  });

  it('setCreators sets selectedCreatorIds array', () => {
    useCampaignStore.getState().setCreators(['creator-1', 'creator-2']);
    expect(useCampaignStore.getState().selectedCreatorIds).toEqual(['creator-1', 'creator-2']);
  });

  it('nextStep increments step', () => {
    useCampaignStore.getState().nextStep();
    expect(useCampaignStore.getState().step).toBe(2);
  });

  it('prevStep decrements step', () => {
    useCampaignStore.getState().goToStep(3);
    useCampaignStore.getState().prevStep();
    expect(useCampaignStore.getState().step).toBe(2);
  });

  it('prevStep floors at 1', () => {
    useCampaignStore.getState().prevStep();
    expect(useCampaignStore.getState().step).toBe(1);
  });

  it('goToStep sets arbitrary step', () => {
    useCampaignStore.getState().goToStep(4);
    expect(useCampaignStore.getState().step).toBe(4);
  });

  it('reset returns to initial state after mutations', () => {
    useCampaignStore.getState().setCountry('sg');
    useCampaignStore.getState().setPackage('pkg-popular');
    useCampaignStore.getState().setCreators(['c-1', 'c-2', 'c-3']);
    useCampaignStore.getState().nextStep();
    useCampaignStore.getState().nextStep();

    useCampaignStore.getState().reset();

    const state = useCampaignStore.getState();
    expect(state.step).toBe(1);
    expect(state.countryId).toBeNull();
    expect(state.promotionType).toBeNull();
    expect(state.productData).toBeNull();
    expect(state.packageId).toBeNull();
    expect(state.selectedCreatorIds).toEqual([]);
  });
});
