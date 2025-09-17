'use client';

import React, { useState, useCallback } from 'react';
import { Copy, Plus, Trash2, Moon, Sun, Download, RotateCcw } from 'lucide-react';

// Types
interface PrismaField {
  id: string;
  name: string;
  type: string;
  isOptional: boolean;
  isArray: boolean;
  isId: boolean;
  isUnique: boolean;
  defaultValue: string;
  mapName: string;
  isUpdatedAt: boolean;
  relationFields: string;
  relationReferences: string;
}

interface PrismaModel {
  name: string;
  fields: PrismaField[];
}

const PRISMA_TYPES = [
  'String', 'Int', 'BigInt', 'Float', 'Decimal', 'Boolean', 
  'DateTime', 'Json', 'Bytes'
];

const DEFAULT_FIELD: Omit<PrismaField, 'id'> = {
  name: '',
  type: 'String',
  isOptional: false,
  isArray: false,
  isId: false,
  isUnique: false,
  defaultValue: '',
  mapName: '',
  isUpdatedAt: false,
  relationFields: '',
  relationReferences: ''
};

export default function PrismaModelGenerator() {
  const [darkMode, setDarkMode] = useState(false);
  const [model, setModel] = useState<PrismaModel>({
    name: '',
    fields: [
      {
        id: '1',
        name: 'id',
        type: 'Int',
        isOptional: false,
        isArray: false,
        isId: true,
        isUnique: false,
        defaultValue: 'autoincrement()',
        mapName: '',
        isUpdatedAt: false,
        relationFields: '',
        relationReferences: ''
      },
      {
        id: '2',
        name: 'createdAt',
        type: 'DateTime',
        isOptional: false,
        isArray: false,
        isId: false,
        isUnique: false,
        defaultValue: 'now()',
        mapName: '',
        isUpdatedAt: false,
        relationFields: '',
        relationReferences: ''
      },
      {
        id: '3',
        name: 'updatedAt',
        type: 'DateTime',
        isOptional: false,
        isArray: false,
        isId: false,
        isUnique: false,
        defaultValue: '',
        mapName: '',
        isUpdatedAt: true,
        relationFields: '',
        relationReferences: ''
      }
    ]
  });
  const [generatedSchema, setGeneratedSchema] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  const generateId = () => Date.now().toString();

  const addField = useCallback(() => {
    setModel(prev => ({
      ...prev,
      fields: [...prev.fields, { ...DEFAULT_FIELD, id: generateId() }]
    }));
  }, []);

  const removeField = useCallback((fieldId: string) => {
    setModel(prev => ({
      ...prev,
      fields: prev.fields.filter(field => field.id !== fieldId)
    }));
  }, []);

  const updateField = useCallback((fieldId: string, updates: Partial<PrismaField>) => {
    setModel(prev => ({
      ...prev,
      fields: prev.fields.map(field => 
        field.id === fieldId ? { ...field, ...updates } : field
      )
    }));
  }, []);

  const updateModelName = useCallback((name: string) => {
    setModel(prev => ({ ...prev, name }));
  }, []);

  const generatePrismaSchema = useCallback(() => {
    if (!model.name.trim()) {
      alert('Please Fill model name');
      return;
    }

    const validFields = model.fields.filter(field => field.name.trim());
    if (validFields.length === 0) {
      alert('Must have 1 field');
      return;
    }

    let schema = `model ${model.name} {\n`;
    
    validFields.forEach(field => {
      let fieldLine = `  ${field.name}`;
      
      // Type with modifiers
      fieldLine += ` ${field.type}`;
      if (field.isArray) fieldLine += '[]';
      if (field.isOptional) fieldLine += '?';
      
      // Attributes
      const attributes = [];
      
      if (field.isId) {
        attributes.push('@id');
        if (field.defaultValue && field.type === 'Int') {
          attributes.push(`@default(${field.defaultValue})`);
        }
      } else if (field.defaultValue) {
        if (field.type === 'String') {
          attributes.push(`@default("${field.defaultValue}")`);
        } else if (['Boolean', 'Int', 'Float'].includes(field.type)) {
          attributes.push(`@default(${field.defaultValue})`);
        } else if (field.type === 'DateTime') {
          attributes.push(`@default(${field.defaultValue})`);
        } else {
          attributes.push(`@default(${field.defaultValue})`);
        }
      }
      
      if (field.isUnique) attributes.push('@unique');
      if (field.isUpdatedAt) attributes.push('@updatedAt');
      if (field.mapName) attributes.push(`@map("${field.mapName}")`);
      
      if (field.relationFields && field.relationReferences) {
        const fieldsArray = field.relationFields.split(',').map(f => f.trim());
        const referencesArray = field.relationReferences.split(',').map(r => r.trim());
        attributes.push(`@relation(fields: [${fieldsArray.join(', ')}], references: [${referencesArray.join(', ')}])`);
      }
      
      if (attributes.length > 0) {
        fieldLine += ` ${attributes.join(' ')}`;
      }
      
      schema += fieldLine + '\n';
    });
    
    schema += '}';
    setGeneratedSchema(schema);
  }, [model]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedSchema);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };


  const resetForm = () => {
    setModel({
      name: '',
      fields: [{
        id: '1',
        name: 'id',
        type: 'Int',
        isOptional: false,
        isArray: false,
        isId: true,
        isUnique: false,
        defaultValue: 'autoincrement()',
        mapName: '',
        isUpdatedAt: false,
        relationFields: '',
        relationReferences: ''
      }]
    });
    setGeneratedSchema('');
  };

  const toggleDarkMode = () => setDarkMode(!darkMode);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
    }`}>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
              Prisma Schema Generator
            </h1>
            <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Create Prisma models Easy!
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={resetForm}
              className={`p-2 rounded-lg transition-colors ${
                darkMode 
                  ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' 
                  : 'bg-white hover:bg-gray-100 text-gray-700'
              } shadow-md`}
              title="Reset Form"
            >
              <RotateCcw size={20} />
            </button>
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg transition-colors ${
                darkMode 
                  ? 'bg-gray-800 hover:bg-gray-700 text-yellow-400' 
                  : 'bg-white hover:bg-gray-100 text-gray-700'
              } shadow-md`}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className={`${
            darkMode ? 'bg-gray-800' : 'bg-white'
          } rounded-xl p-6 shadow-xl`}>
            <h2 className="text-2xl font-semibold mb-6">Model Configuration</h2>
            
            {/* Model Name */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Model Name</label>
              <input
                type="text"
                value={model.name}
                onChange={(e) => updateModelName(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
                placeholder="e.g., User, Post, Comment"
              />
            </div>

            {/* Fields */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Fields</h3>
                <button
                  onClick={addField}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                  <Plus size={16} />
                  Add Field
                </button>
              </div>

              {model.fields.map((field, index) => (
                <div
                  key={field.id}
                  className={`p-4 rounded-lg border ${
                    darkMode ? 'border-gray-600 bg-gray-750' : 'border-gray-200 bg-gray-50'
                  } transition-all hover:shadow-md`}
                >
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs font-medium mb-1">Field Name</label>
                      <input
                        type="text"
                        value={field.name}
                        onChange={(e) => updateField(field.id, { name: e.target.value })}
                        className={`w-full px-3 py-2 text-sm rounded border focus:ring-1 focus:ring-blue-500 ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        placeholder="fieldName"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Type</label>
                      <select
                        value={field.type}
                        onChange={(e) => updateField(field.id, { type: e.target.value })}
                        className={`w-full px-3 py-2 text-sm rounded border focus:ring-1 focus:ring-blue-500 ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      >
                        {PRISMA_TYPES.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Checkboxes */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {[
                      { key: 'isOptional', label: 'Optional (?)' },
                      { key: 'isArray', label: 'Array ([])' },
                      { key: 'isId', label: '@id' },
                      { key: 'isUnique', label: '@unique' },
                      { key: 'isUpdatedAt', label: '@updatedAt' }
                    ].map(({ key, label }) => (
                      <label key={key} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={field[key as keyof PrismaField] as boolean}
                          onChange={(e) => updateField(field.id, { [key]: e.target.checked })}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        />
                        {label}
                      </label>
                    ))}
                  </div>

                  {/* Optional Fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium mb-1">Default Value</label>
                      <input
                        type="text"
                        value={field.defaultValue}
                        onChange={(e) => updateField(field.id, { defaultValue: e.target.value })}
                        className={`w-full px-3 py-2 text-sm rounded border focus:ring-1 focus:ring-blue-500 ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        placeholder="e.g., now(), true"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Map Name</label>
                      <input
                        type="text"
                        value={field.mapName}
                        onChange={(e) => updateField(field.id, { mapName: e.target.value })}
                        className={`w-full px-3 py-2 text-sm rounded border focus:ring-1 focus:ring-blue-500 ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        placeholder="database_field_name"
                      />
                    </div>
                  </div>

                  {/* Relation Fields */}
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-xs font-medium mb-1">Relation Fields</label>
                      <input
                        type="text"
                        value={field.relationFields}
                        onChange={(e) => updateField(field.id, { relationFields: e.target.value })}
                        className={`w-full px-3 py-2 text-sm rounded border focus:ring-1 focus:ring-blue-500 ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        placeholder="userId, categoryId"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">References</label>
                      <input
                        type="text"
                        value={field.relationReferences}
                        onChange={(e) => updateField(field.id, { relationReferences: e.target.value })}
                        className={`w-full px-3 py-2 text-sm rounded border focus:ring-1 focus:ring-blue-500 ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        placeholder="id, id"
                      />
                    </div>
                  </div>

                  {model.fields.length > 1 && (
                    <button
                      onClick={() => removeField(field.id)}
                      className="mt-4 flex items-center gap-2 px-3 py-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 size={14} />
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={generatePrismaSchema}
              className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-lg transition-all transform hover:scale-105 shadow-lg"
            >
              Generate Prisma Schema
            </button>
          </div>

          {/* Output Section */}
          <div className={`${
            darkMode ? 'bg-gray-800' : 'bg-white'
          } rounded-xl p-6 shadow-xl`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Generated Schema</h2>
              {generatedSchema && (
                <div className="flex gap-2">
                  <button
                    onClick={copyToClipboard}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      copySuccess 
                        ? 'bg-green-500 text-white' 
                        : darkMode 
                          ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    <Copy size={16} />
                    {copySuccess ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              )}
            </div>

            {generatedSchema ? (
              <div className="relative">
                <pre className={`p-4 rounded-lg overflow-x-auto text-sm ${
                  darkMode ? 'bg-gray-900' : 'bg-gray-100'
                }`}>
                  <code className={`${darkMode ? 'text-green-400' : 'text-green-700'}`}>
                    {generatedSchema}
                  </code>
                </pre>
              </div>
            ) : (
              <div className={`p-8 text-center rounded-lg border-2 border-dashed ${
                darkMode ? 'border-gray-600 text-gray-400' : 'border-gray-300 text-gray-500'
              }`}>
                <p>Fill model data and press "Generate" to see Prisma schema</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Made with ❤️ for developers who love Prisma
          </p>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            And Made with 🩵 By Thanapon
          </p>
        </div>
      </div>
    </div>
  );
}