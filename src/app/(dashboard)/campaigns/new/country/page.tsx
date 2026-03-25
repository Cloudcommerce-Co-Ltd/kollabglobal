'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check } from 'lucide-react';
import { useCampaignStore } from '@/stores/campaign-store';
import type { Country } from '@/types';

type Tab = 'asia' | 'global';

export default function SelectCountryPage() {
  const router = useRouter();
  const { setCountry, reset } = useCampaignStore();

  const [tab, setTab] = useState<Tab>('asia');
  const [selected, setSelected] = useState<number | null>(null);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reset();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetch('/api/countries')
      .then(r => r.json())
      .then((data: Country[]) => {
        setCountries(data);
        setLoading(false);
      });
  }, []);

  const asiaCountries = countries.filter(c => c.region === 'asia');
  const globalCountries = countries.filter(c => c.region === 'global');
  const list = tab === 'asia' ? asiaCountries : globalCountries;

  function handleSelect(data: Country) {
    setSelected(data.id);
    setCountry(data);
  }

  function handleNext() {
    if (!selected) return;
    router.push('/campaigns/new/product');
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* Page header */}
      <div className="border-b border-border-ui bg-white px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-275">
          <button
            onClick={() => router.push('/')}
            className="mb-2.5 flex cursor-pointer items-center gap-1.5 border-none bg-transparent text-sm font-semibold text-muted-text"
          >
            <ArrowLeft size={16} />
            กลับหน้าหลัก
          </button>
          <h1 className="m-0 text-[20px] font-bold text-dark sm:text-[26px]">
            เลือกตลาดเป้าหมาย
          </h1>
          <p className="m-0 mt-0.5 text-sm text-muted-text">
            เลือกพื้นที่ที่คุณต้องการโปรโมทแบรนด์
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-275 px-4 sm:px-6 lg:px-8">
        {/* Tab bar */}
        <div className="mb-7 flex gap-1 border-b-2 border-border-ui">
          {(['asia', 'global'] as Tab[]).map(k => (
            <button
              key={k}
              onClick={() => {
                setTab(k);
              }}
              className={`cursor-pointer border-x-0 border-t-0 border-b-[3px] bg-transparent px-4 py-3 text-[15px] font-semibold transition-all sm:px-7 ${
                tab === k
                  ? 'border-brand text-brand'
                  : 'border-transparent text-muted-text'
              }`}
            >
              {k === 'asia' ? 'Asia' : 'Global'}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {loading ? (
              <div className="col-span-2 py-12 text-center text-muted-text">
                กำลังโหลด...
              </div>
            ) : (
              list.map(c => {
                const isSelected = selected === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => handleSelect(c)}
                    className={`flex cursor-pointer items-center gap-3.5 rounded-[14px] border-2 p-4.5 text-left transition-all ${
                      isSelected
                        ? 'border-brand bg-brand-light'
                        : 'border-border-ui bg-white'
                    }`}
                  >
                    <div className="flex size-13 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-[#e8f8f7] to-[#e8f0fa] text-[30px]">
                      {c.flag}
                    </div>
                    <div className="flex-1">
                      <div
                        className={`text-base font-semibold ${isSelected ? 'text-brand' : 'text-dark'}`}
                      >
                        {c.name}
                      </div>
                      {c.creatorsAvail != null && (
                        <div className="mt-0.5 text-[13px] text-muted-text">
                          {c.creatorsAvail.toLocaleString()} ครีเอเตอร์
                        </div>
                      )}
                    </div>
                    <div
                      className={`flex size-5.5 items-center justify-center rounded-full border-2 ${
                        isSelected
                          ? 'border-brand bg-brand'
                          : 'border-[#ccc] bg-transparent'
                      }`}
                    >
                      {isSelected && <Check size={13} color="#fff" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>
          <div />
        </div>

        {/* CTA */}
        <div className="mt-7 flex justify-end pb-8">
          <button
            disabled={!selected}
            onClick={handleNext}
            className={`w-full rounded-xl border-none px-8 py-3.5 text-[15px] font-semibold text-white transition-all sm:w-auto ${
              selected
                ? 'cursor-pointer bg-brand'
                : 'cursor-not-allowed bg-[#ccc]'
            }`}
          >
            ถัดไป — เพิ่มสินค้า / บริการ
          </button>
        </div>
      </div>
    </div>
  );
}
