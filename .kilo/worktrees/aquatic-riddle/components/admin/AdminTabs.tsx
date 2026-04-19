"use client";

import React from 'react';
import { JsonUploader } from './JsonUploader';
import { brainRingSchema } from '@/lib/validation/brainRingSchema';

export function AdminTabs() {
  return (
    <div className="space-y-6">
      <JsonUploader mode="brain-ring" schema={brainRingSchema} />
    </div>
  );
}
