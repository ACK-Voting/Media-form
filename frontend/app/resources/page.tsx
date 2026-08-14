'use client';

import { useState } from 'react';
import Navbar from '../_components/Navbar';
import Footer from '../_components/Footer';
import { useResourcesStore } from '@/stores/cms/resourcesStore';
import type { Resource } from '@/app/_data/contentTypes';
import EnquiryModal from '@/app/_components/EnquiryModal';

type FilterCategory = 'All' | Resource['category'];

const FILTER_CATEGORIES: FilterCategory[] = ['All', 'Bulletin', 'Prayer Guide', 'Document', 'News'];

const CATEGORY_COLORS: Record<Resource['category'], string> = {
  Bulletin: 'bg-blue-100 text-blue-700',
  'Prayer Guide': 'bg-indigo-100 text-indigo-700',
  Document: 'bg-gray-100 text-gray-700',
  News: 'bg-amber-100 text-amber-700',
};

const FILE_TYPE_STYLE: Record<string, { bg: string; text: string }> = {
  PDF:  { bg: 'bg-red-50',    text: 'text-red-600' },
  DOCX: { bg: 'bg-blue-50',   text: 'text-blue-600' },
  DOC:  { bg: 'bg-blue-50',   text: 'text-blue-600' },
  XLSX: { bg: 'bg-green-50',  text: 'text-green-600' },
  XLS:  { bg: 'bg-green-50',  text: 'text-green-600' },
  PPTX: { bg: 'bg-orange-50', text: 'text-orange-600' },
  PPT:  { bg: 'bg-orange-50', text: 'text-orange-600' },
};

function FileTypeIcon({ type }: { type: string }) {
  const style = FILE_TYPE_STYLE[type] ?? { bg: 'bg-gray-50', text: 'text-gray-500' };
  return (
    <div className={`w-12 h-12 rounded-xl ${style.bg} flex items-center justify-center flex-shrink-0`}>
      <span className={`text-[11px] font-bold ${style.text}`}>{type || 'FILE'}</span>
    </div>
  );
}

// Human-friendly label for the filter pills
const FILTER_LABEL: Record<FilterCategory, string> = {
  'All': 'All',
  'Bulletin': 'Bulletins',
  'Prayer Guide': 'Prayer Guides',
  'Document': 'Documents',
  'News': 'News',
};

export default function ResourcesPage() {
  const resources = useResourcesStore((s) => s.resources);
  const [active, setActive] = useState<FilterCategory>('All');
  const [enquiryOpen, setEnquiryOpen] = useState(false);

  const filtered = active === 'All'
    ? resources.filter((r) => r.url) // only show resources with an uploaded file
    : resources.filter((r) => r.url && r.category === active);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="pt-20 relative bg-cover bg-center text-white" style={{ backgroundImage: "url('/Background.jpeg')" }}>
        <div className="absolute inset-0 bg-gray-900/70" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="inline-block bg-white/10 border border-white/20 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            RESOURCES
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Downloads &amp; Resources</h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Access service bulletins, prayer guides, strategic documents, and cathedral news all in one place.
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <section className="bg-white border-b border-gray-200 sticky top-[72px] z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap gap-2">
            {FILTER_CATEGORIES.map((cat) => (
              <button key={cat} onClick={() => setActive(cat)}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${active === cat ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                {FILTER_LABEL[cat]}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Resources Grid */}
      <section className="py-14 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filtered.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((resource) => (
                <div key={resource.id} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow border border-gray-100 flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${CATEGORY_COLORS[resource.category]}`}>
                      {resource.category}
                    </span>
                    <span className="text-xs text-gray-400">{resource.date}</span>
                  </div>

                  <div className="flex items-center gap-3 mb-4 flex-1">
                    <FileTypeIcon type={resource.fileType} />
                    <div className="min-w-0">
                      <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2">{resource.title}</h3>
                      {resource.description && (
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{resource.description}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-0.5">{resource.fileType} · {resource.fileSize}</p>
                    </div>
                  </div>

                  <a
                    href={resource.url}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 bg-gray-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl hover:bg-gray-700 transition-colors mt-auto"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-gray-400 text-base font-medium">No resources in this category yet.</p>
              <p className="text-gray-300 text-sm mt-1">Check back soon or contact the office.</p>
            </div>
          )}
        </div>
      </section>

      {/* Can't find section */}
      <section className="py-14 bg-white border-t border-gray-100">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Can&apos;t Find What You Need?</h2>
          <p className="text-gray-600 mb-6 text-sm">Contact the cathedral office and we will assist you in getting the document or resource you are looking for.</p>
          <button onClick={() => setEnquiryOpen(true)} className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-700 transition-colors text-sm">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            Contact the Office
          </button>
        </div>
      </section>

      <EnquiryModal
        open={enquiryOpen}
        onClose={() => setEnquiryOpen(false)}
        title="Request a Document"
        intro="Tell us what you are looking for and the office will send it to you."
        subject="Resource request"
        submitLabel="Send Request"
        extraFields={[{ name: 'document', label: 'What are you looking for?', required: true, placeholder: 'e.g. Sunday bulletin, 12 July' }]}
      />

      <Footer />
    </div>
  );
}
