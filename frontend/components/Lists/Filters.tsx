"use client";

import { clsx } from "clsx";
import Select from "../Inputs/Select";
import TextInput from "../Inputs/TextInput";

/**
 * Define la estructura de un filtro individual
 */
export interface FilterField {
  id: string; // identificador único del campo
  label: string; // etiqueta visible
  type: 'text' | 'select' | 'date' | 'number' | 'checkbox'; // tipo de input
  placeholder?: string; // placeholder para text inputs
  options?: Array<{ label: string; value: string }>; // opciones para select
}

/**
 * Interface para los valores de los filtros
 * Ejemplo: { name: "Juan", status: "active", date: "2024-01-01" }
 */
export interface FilterValues {
  [key: string]: string | number | boolean | undefined;
}

interface FiltersProps {
  fields: FilterField[]; // campos de filtro a renderizar
  values: FilterValues; // valores actuales de los filtros
  onFiltersChange: (values: FilterValues) => void; // callback cuando cambian los filtros
  onApply?: () => void; // callback opcional cuando se aplican los filtros
  showApplyButton?: boolean; // mostrar botón aplicar (default: false, cambios en tiempo real)
}

/**
 * Componente de filtros genérico
 * 
 * Ejemplo de uso:
 * 
 * const filterFields: FilterField[] = [
 *   { id: 'name', label: 'Nombre', type: 'text', placeholder: 'Buscar...' },
 *   { id: 'status', label: 'Estado', type: 'select', options: [{ label: 'Activo', value: 'active' }] },
 * ];
 * 
 * <Filters
 *   fields={filterFields}
 *   values={filterValues}
 *   onFiltersChange={setFilterValues}
 *   showApplyButton={true}
 * />
 */
export default function Filters({
  fields,
  values,
  onFiltersChange,
  onApply,
  showApplyButton = false,
}: FiltersProps) {
  const toInputValue = (value: FilterValues[string]) => {
    if (typeof value === "string" || typeof value === "number") {
      return value;
    }

    return "";
  };

  const handleInputChange = (fieldId: string, value: string | number | boolean | undefined) => {
    onFiltersChange({
      ...values,
      [fieldId]: value === "" ? undefined : value,
    });
  };

  const handleClearFilters = () => {
    const clearedValues: FilterValues = {};
    fields.forEach(field => {
      clearedValues[field.id] = undefined;
    });
    onFiltersChange(clearedValues);
  };

  return (
    <div className="w-full bg-white rounded-lg border border-background-light p-4 mb-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {fields.map(field => (
          <div key={field.id}>
            {field.type === 'select' ? (
              <Select
                id={field.id}
                labelText={field.label}
                value={toInputValue(values[field.id])}
                onChange={(e) => handleInputChange(field.id, e.target.value)}
              >
                {field.options?.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            ) : field.type === 'checkbox' ? (
              <label className="flex items-center gap-2 text-text-muted select-none mt-7">
                <input
                  id={field.id}
                  type="checkbox"
                  checked={values[field.id] === true}
                  onChange={(e) => handleInputChange(field.id, e.target.checked ? true : undefined)}
                />
                <span>{field.label}</span>
              </label>
            ) : (
              <TextInput
                id={field.id}
                labelText={field.label}
                type={field.type}
                placeholder={field.placeholder}
                value={toInputValue(values[field.id])}
                onChange={(e) => handleInputChange(field.id, e.target.value)}
              />
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        {showApplyButton && (
          <button
            onClick={onApply}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Aplicar Filtros
          </button>
        )}
        <button
          onClick={handleClearFilters}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
        >
          Limpiar Filtros
        </button>
      </div>
    </div>
  );
}
