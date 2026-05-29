/**
 * EJEMPLO DE USO DEL COMPONENTE FILTERS
 * 
 * Este archivo muestra cómo usar el componente genérico de filtros
 * en una página que tenga una lista.
 */

import { useState } from 'react';
import Filters, { FilterField, FilterValues } from '@/components/Lists/Filters';

export default function ExampleFiltersInList() {
  // Define los campos de filtro que necesitas
  const filterFields: FilterField[] = [
    {
      id: 'name',
      label: 'Nombre',
      type: 'text',
      placeholder: 'Buscar por nombre...',
    },
    {
      id: 'status',
      label: 'Estado',
      type: 'select',
      options: [
        { label: 'Activo', value: 'active' },
        { label: 'Inactivo', value: 'inactive' },
        { label: 'Pendiente', value: 'pending' },
      ],
    },
    {
      id: 'date',
      label: 'Fecha',
      type: 'date',
    },
    {
      id: 'category',
      label: 'Categoría',
      type: 'select',
      options: [
        { label: 'Categoría A', value: 'cat_a' },
        { label: 'Categoría B', value: 'cat_b' },
        { label: 'Categoría C', value: 'cat_c' },
      ],
    },
  ];

  // Estado para mantener los valores de los filtros
  const [filterValues, setFilterValues] = useState<FilterValues>({
    name: '',
    status: '',
    date: '',
    category: '',
  });

  // Manejador cuando cambian los filtros
  const handleFiltersChange = (newValues: FilterValues) => {
    setFilterValues(newValues);
    console.log('Filtros actualizados:', newValues);
    // Aquí puedes hacer una llamada a la API para filtrar datos
  };

  // Manejador cuando se presiona el botón Aplicar
  const handleApplyFilters = () => {
    console.log('Aplicar filtros:', filterValues);
    // Aquí puedes hacer la búsqueda con los filtros
  };

  return (
    <div className="w-full">
      {/* Componente de Filtros */}
      <Filters
        fields={filterFields}
        values={filterValues}
        onFiltersChange={handleFiltersChange}
        onApply={handleApplyFilters}
        showApplyButton={true} // true si quieres botón aplicar, false para cambios en tiempo real
      />

      {/* Aquí irían tus datos filtrados */}
      <div className="bg-white rounded-lg p-4">
        <h2>Datos filtrados</h2>
        <pre>{JSON.stringify(filterValues, null, 2)}</pre>
      </div>
    </div>
  );
}

/**
 * FORMAS DE USAR:
 * 
 * 1. CON BOTÓN APLICAR (filtros se aplican manualmente):
 *    <Filters
 *      fields={filterFields}
 *      values={filterValues}
 *      onFiltersChange={setFilterValues}
 *      onApply={handleSearch}
 *      showApplyButton={true}
 *    />
 * 
 * 2. SIN BOTÓN APLICAR (filtros se aplican en tiempo real):
 *    <Filters
 *      fields={filterFields}
 *      values={filterValues}
 *      onFiltersChange={handleFiltersChange} // aquí filtras inmediatamente
 *      showApplyButton={false}
 *    />
 * 
 * 3. CON TIPOS PERSONALIZADOS:
 *    const filterFields: FilterField[] = [
 *      { id: 'search', label: 'Buscar', type: 'text' },
 *      { id: 'role', label: 'Rol', type: 'select', 
 *        options: [
 *          { label: 'Admin', value: 'admin' },
 *          { label: 'User', value: 'user' },
 *        ]
 *      },
 *      { id: 'startDate', label: 'Desde', type: 'date' },
 *      { id: 'count', label: 'Cantidad', type: 'number' },
 *    ];
 */
