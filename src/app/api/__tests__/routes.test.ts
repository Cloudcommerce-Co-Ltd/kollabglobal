import { describe, it, expect } from 'vitest';
import { GET as getCountries } from '../countries/route';
import { GET as getPackages } from '../packages/route';
import { GET as getCreators } from '../creators/route';

describe('GET /api/countries', () => {
  it('returns 200', async () => {
    const res = await getCountries();
    expect(res.status).toBe(200);
  });

  it('returns an array', async () => {
    const res = await getCountries();
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
  });

  it('returns only active countries (8)', async () => {
    const res = await getCountries();
    const data = await res.json();
    expect(data).toHaveLength(8);
  });

  it('returns countries ordered by name ascending', async () => {
    const res = await getCountries();
    const data = await res.json();
    const names: string[] = data.map((c: { name: string }) => c.name);
    expect(names).toEqual([...names].sort());
  });

  it('each country has required fields and isActive=true', async () => {
    const res = await getCountries();
    const data = await res.json();
    for (const country of data) {
      expect(country).toHaveProperty('id');
      expect(country).toHaveProperty('name');
      expect(country).toHaveProperty('flag');
      expect(country.isActive).toBe(true);
    }
  });
});

describe('GET /api/packages', () => {
  it('returns 200', async () => {
    const res = await getPackages();
    expect(res.status).toBe(200);
  });

  it('returns exactly 3 packages', async () => {
    const res = await getPackages();
    const data = await res.json();
    expect(data).toHaveLength(3);
  });

  it('returns packages ordered by numCreators ascending', async () => {
    const res = await getPackages();
    const data = await res.json();
    const counts: number[] = data.map((p: { numCreators: number }) => p.numCreators);
    expect(counts).toEqual([5, 10, 15]);
  });

  it('each package has required fields', async () => {
    const res = await getPackages();
    const data = await res.json();
    for (const pkg of data) {
      expect(pkg).toHaveProperty('id');
      expect(pkg).toHaveProperty('name');
      expect(pkg).toHaveProperty('numCreators');
      expect(pkg).toHaveProperty('price');
    }
  });
});

describe('GET /api/creators', () => {
  it('returns 200', async () => {
    const res = await getCreators();
    expect(res.status).toBe(200);
  });

  it('returns at least 15 creators (10 main + 5 backup)', async () => {
    const res = await getCreators();
    const data = await res.json();
    expect(data.length).toBeGreaterThanOrEqual(15);
  });

  it('includes both main and backup creators', async () => {
    const res = await getCreators();
    const data = await res.json();
    const hasMain = data.some((c: { isBackup: boolean }) => !c.isBackup);
    const hasBackup = data.some((c: { isBackup: boolean }) => c.isBackup);
    expect(hasMain).toBe(true);
    expect(hasBackup).toBe(true);
  });

  it('each creator has required fields', async () => {
    const res = await getCreators();
    const data = await res.json();
    for (const creator of data) {
      expect(creator).toHaveProperty('id');
      expect(creator).toHaveProperty('name');
      expect(creator).toHaveProperty('niche');
      expect(creator).toHaveProperty('engagement');
      expect(creator).toHaveProperty('reach');
    }
  });
});
