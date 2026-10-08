import React, { useState, useMemo } from 'react';
import { Pill, Plus, Eye, Check, AlertCircle, Sparkles, Filter, Search, X, ShieldCheck, Truck, CheckCircle2 } from 'lucide-react';
import { usePharmacy } from '../../context/PharmacyContext';
import { ASSETS } from '../../assets/images';
import { DrugItem, DrugCategory } from '../../types/pharmacy';
import { formatCurrency } from '../../utils/formatters';

interface DrugCatalogProps {
  searchQuery?: string;
  onSelectDrug: (drug: DrugItem) => void;
  onOpenConsultation: () => void;
  onOpenPrescriptionUpload: () => void;
}

const CATEGORIES: ('All' | DrugCategory)[] = [
  'All',
  'Prescription',
  'Chronic Care',
  'Over-the-Counter',
  'Mother & Child',
  'Vitamins & Supplements',
  'Medical Devices',
  'First Aid & Wound Care',
];

export const DrugCatalog: React.FC<DrugCatalogProps> = ({
  searchQuery = '',
  onSelectDrug,
  onOpenConsultation,
  onOpenPrescriptionUpload,
}) => {
  const { drugs, addToCart, cart } = usePharmacy();
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [selectedCategory, setSelectedCategory] = useState<'All' | DrugCategory>('All');
  const [rxFilter, setRxFilter] = useState<'all' | 'rx-only' | 'otc-only'>('all');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'name'>('featured');
  const [addedNotice, setAddedNotice] = useState<string | null>(null);

  const activeSearch = localSearch || searchQuery;

  const filteredDrugs = useMemo(() => {
    return drugs.filter(drug => {
      // Category match
      if (selectedCategory !== 'All' && drug.category !== selectedCategory) {
        return false;
      }
      // Prescription filter
      if (rxFilter === 'rx-only' && !drug.requiresPrescription) return false;
      if (rxFilter === 'otc-only' && drug.requiresPrescription) return false;

      // In stock filter
      if (inStockOnly && drug.stockLevel <= 0) return false;

      // Search match
      if (activeSearch.trim()) {
        const q = activeSearch.toLowerCase();
        const matchName = drug.name.toLowerCase().includes(q);
        const matchGeneric = drug.genericName.toLowerCase().includes(q);
        const matchBrand = drug.brand.toLowerCase().includes(q);
        const matchCategory = drug.category.toLowerCase().includes(q);
        if (!matchName && !matchGeneric && !matchBrand && !matchCategory) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.sellingPrice - b.sellingPrice;
      if (sortBy === 'price-desc') return b.sellingPrice - a.sellingPrice;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0; // featured / default
    });
  }, [drugs, selectedCategory, rxFilter, inStockOnly, activeSearch, sortBy]);

  const handleAddToCart = (drug: DrugItem, e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(drug, 1);
    setAddedNotice(drug.id);
    setTimeout(() => setAddedNotice(null), 1500);
  };

  return (
    <section id="catalog-section" className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 uppercase tracking-wider mb-1">
            <Pill className="w-4 h-4" />
            <span>Digital Dispensary Catalog</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Certified Medications & Health Supplies
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Carefully curated, genuine pharmaceuticals stored under strict temperature controls.
          </p>
        </div>

        {/* Quick Prescription Upload Helper Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center justify-between gap-3 text-xs">
          <div>
            <p className="font-semibold text-blue-900">Have a Doctor's Prescription?</p>
            <p className="text-slate-600">Upload your slip and our pharmacists will handle the rest.</p>
          </div>
          <button
            onClick={onOpenPrescriptionUpload}
            className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer shrink-0"
          >
            Upload Slip
          </button>
        </div>
      </div>

      {/* Verified Dispensary Stock Visual Banner */}
      <div className="mb-8 rounded-2xl overflow-hidden border border-blue-200 bg-blue-950 text-white shadow-sm relative">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-8 p-6 sm:p-8 space-y-3">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-blue-800/80 rounded-md text-[11px] font-semibold text-blue-200">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-300" />
              <span>Good Distribution Practice (GDP) Certified Dispensary</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
              Direct Sourcing From Prequalified Pharmaceutical Laboratories
            </h3>
            <p className="text-xs sm:text-sm text-blue-200 leading-relaxed max-w-xl">
              Every medication in our catalog is preserved in our climate-regulated storage units at 15°C–25°C, ensuring full potency and zero degradation from tropical heat.
            </p>
            <div className="flex flex-wrap gap-4 pt-1 text-xs text-blue-300">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>NAFDAC Batch Tracked</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Temperature Monitored</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>PCN Pharmacist Verified</span>
              </div>
            </div>
          </div>
          <div className="md:col-span-4 h-48 md:h-full relative overflow-hidden">
            <img
              src={ASSETS.clientPurpleShelves}
              alt="Almedix Verified Stock & blue Shelving"
              className="w-full h-full object-cover min-h-[180px]"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-950 via-blue-950/20 to-transparent pointer-events-none hidden md:block" />
          </div>
        </div>
      </div>

      {/* Live Search Input Bar */}
      <div className="relative max-w-xl mb-6">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search brand, generic active ingredient, or indication (e.g. Metformin, Coartem, Augmentin)..."
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none shadow-2xs text-slate-800 placeholder-slate-400"
        />
        {localSearch && (
          <button
            onClick={() => setLocalSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Interactive Category Selector Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none mb-6">
        {CATEGORIES.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              selectedCategory === category
                ? 'bg-blue-700 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-blue-100 text-slate-700'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Filter and Sort Sub-Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 py-3 px-4 bg-slate-50 border border-slate-200 rounded-xl mb-8 text-xs text-slate-700">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-blue-700" />
            <span className="font-medium text-slate-900">Filter:</span>
            <div className="flex items-center gap-1 bg-white p-0.5 border border-slate-200 rounded-lg">
              <button
                onClick={() => setRxFilter('all')}
                className={`px-2.5 py-1 rounded text-xs font-medium ${
                  rxFilter === 'all' ? 'bg-blue-100 text-blue-900 font-semibold' : 'text-slate-600'
                }`}
              >
                All Items
              </button>
              <button
                onClick={() => setRxFilter('rx-only')}
                className={`px-2.5 py-1 rounded text-xs font-medium ${
                  rxFilter === 'rx-only' ? 'bg-blue-100 text-blue-900 font-semibold' : 'text-slate-600'
                }`}
              >
                Rx Required
              </button>
              <button
                onClick={() => setRxFilter('otc-only')}
                className={`px-2.5 py-1 rounded text-xs font-medium ${
                  rxFilter === 'otc-only' ? 'bg-blue-100 text-blue-900 font-semibold' : 'text-slate-600'
                }`}
              >
                OTC (No Rx)
              </button>
            </div>
          </div>

          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
            />
            <span>In Stock Only</span>
          </label>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-500">Showing {filteredDrugs.length} medicines</span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span className="font-medium">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-white border border-slate-200 rounded-md px-2 py-1 text-xs focus:ring-1 focus:ring-blue-600 outline-none"
          >
            <option value="featured">Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name">Name: A to Z</option>
          </select>
        </div>
      </div>

      {/* Drug Cards Grid */}
      {drugs.length === 0 ? (
        <div className="py-16 text-center bg-blue-50/50 rounded-2xl border border-blue-100">
          <Pill className="w-12 h-12 text-blue-400 mx-auto mb-3" />
          <p className="text-lg font-bold text-slate-800">Our dispensary is currently empty.</p>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
            The pharmacy inventory is currently being updated. Please check back later or contact a pharmacist.
          </p>
          <button
            onClick={onOpenConsultation}
            className="px-4 py-2 text-xs font-semibold bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors cursor-pointer"
          >
            Consult Clinical Pharmacist
          </button>
        </div>
      ) : filteredDrugs.length === 0 ? (
        <div className="py-16 text-center bg-blue-50/50 rounded-2xl border border-blue-100">
          <Search className="w-12 h-12 text-blue-400 mx-auto mb-3" />
          <p className="text-lg font-bold text-slate-800">No medications found matching your criteria</p>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
            Try adjusting your search terms or filters. If you cannot find what you're looking for, request a pharmacist consultation.
          </p>
          <button
            onClick={onOpenConsultation}
            className="px-4 py-2 text-xs font-semibold bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors cursor-pointer"
          >
            Consult Clinical Pharmacist
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredDrugs.map(drug => {
            const inCart = cart.find(c => c.drug.id === drug.id);
            const isOutOfStock = drug.stockLevel <= 0;
            const isLowStock = drug.stockLevel > 0 && drug.stockLevel <= drug.minStockLevel;

            return (
              <div
                key={drug.id}
                onClick={() => onSelectDrug(drug)}
                className="group bg-white rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between overflow-hidden cursor-pointer"
              >
                {/* Visual Top Slot */}
                <div className="relative bg-slate-50 p-6 flex items-center justify-center border-b border-slate-100 group-hover:bg-blue-50/30 transition-colors">
                  <div className="w-20 h-20 rounded-2xl bg-white shadow-xs border border-blue-100 flex items-center justify-center text-blue-700 group-hover:scale-105 transition-transform">
                    <Pill className="w-10 h-10 stroke-[1.5]" />
                  </div>

                  {/* Badges / indicators */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1">
                    {drug.requiresPrescription && (
                      <span className="text-[10px] font-bold text-blue-800 bg-blue-100/90 px-2 py-0.5 rounded-sm">
                        Prescription Only (Rx)
                      </span>
                    )}
                  </div>

                  <div className="absolute top-3 right-3">
                    {isOutOfStock ? (
                      <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-sm">
                        Out of Stock
                      </span>
                    ) : isLowStock ? (
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-sm">
                        Low Stock ({drug.stockLevel})
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-sm">
                        In Stock
                      </span>
                    )}
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Unboxed metadata according to Zero-Pill rule */}
                    <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mb-1.5 flex-wrap">
                      <span className="font-semibold text-blue-900">{drug.brand}</span>
                      <span aria-hidden="true">·</span>
                      <span>{drug.dosageForm}</span>
                      <span aria-hidden="true">·</span>
                      <span>{drug.strength}</span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-700 transition-colors line-clamp-1">
                      {drug.name}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-1 italic mt-0.5">
                      {drug.genericName}
                    </p>

                    <p className="text-xs text-slate-600 line-clamp-2 mt-2 leading-relaxed">
                      {drug.description}
                    </p>
                  </div>

                  {/* Price & Purchase Bar */}
                  <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div>
                      <span className="text-xs text-slate-400 block">Unit Price</span>
                      <span className="text-base font-bold text-blue-950 font-mono tabular-nums">
                        {formatCurrency(drug.sellingPrice)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectDrug(drug);
                        }}
                        title="View Drug Information"
                        className="p-2 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={(e) => handleAddToCart(drug, e)}
                        disabled={isOutOfStock}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1 transition-all ${
                          isOutOfStock
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            : addedNotice === drug.id
                            ? 'bg-emerald-600 text-white'
                            : inCart
                            ? 'bg-blue-100 text-blue-900 hover:bg-blue-200'
                            : 'bg-blue-700 hover:bg-blue-800 text-white shadow-xs'
                        }`}
                      >
                        {addedNotice === drug.id ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Added</span>
                          </>
                        ) : inCart ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-blue-700" />
                            <span>In Bag ({inCart.quantity})</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
