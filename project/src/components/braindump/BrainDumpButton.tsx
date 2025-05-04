import React, { useState } from 'react';
import { Brain } from 'lucide-react';
import BrainDumpModal from './BrainDumpModal';

const BrainDumpButton: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="inline-flex items-center rounded-md bg-accent-500 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-accent-600 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2"
        onClick={() => setIsModalOpen(true)}
      >
        <Brain className="-ml-0.5 mr-2 h-4 w-4" />
        Brain Dump
      </button>
      
      <BrainDumpModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};

export default BrainDumpButton;