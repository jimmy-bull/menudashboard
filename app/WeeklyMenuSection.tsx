import { Edit, Plus, Search, Trash, Loader } from "lucide-react";
import { WeeklyItem } from "./types";

interface Props {
  weeklyMenuItems: WeeklyItem[];
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  onAddOpen: () => void;
  onEditOpen: (item: WeeklyItem) => void;
  onDeleteOpen: (item: WeeklyItem) => void;
  onDeleteAll: () => void;
  isDeletingAllWeeklyMenuItems?: boolean;
}

export default function WeeklyMenuSection({
  weeklyMenuItems,
  searchTerm,
  setSearchTerm,
  onAddOpen,
  onEditOpen,
  onDeleteOpen,
  onDeleteAll,
  isDeletingAllWeeklyMenuItems,
}: Props) {
  let filteredWeeklyMenuItems;
  if (weeklyMenuItems !== undefined && weeklyMenuItems.length > 0) {
    filteredWeeklyMenuItems = weeklyMenuItems.filter(
      (item) =>
        item.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">
          Menu de la semaine
        </h1>
        <div className="flex gap-2">
          <button
            onClick={onDeleteAll}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            disabled={isDeletingAllWeeklyMenuItems}
          >
            {isDeletingAllWeeklyMenuItems ? (
              <Loader className="-ml-1 mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Trash className="-ml-1 mr-2 h-5 w-5" />
            )}
            Supprimer tout
          </button>
          <button
            onClick={onAddOpen}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Plus className="-ml-1 mr-2 h-5 w-5" /> Ajouter un plat
          </button>
        </div>
      </div>

      {/* <div className="mt-4 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="Rechercher un plat..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div> */}

      <div className="mt-8 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Code
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Nom
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Catégorie
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Prix
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Options
              </th>
              <th className="px-6 py-3" />
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredWeeklyMenuItems !== undefined &&
              filteredWeeklyMenuItems.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.code}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.nom}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.categorie === "entree" ? "Entrée" : "Plat principal"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.prix} CHF
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex gap-2">
                      {item.vegetarien && (
                        <span className="px-2 inline-flex text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          Végétarien
                        </span>
                      )}
                      {item.sans_gluten && (
                        <span className="px-2 inline-flex text-xs font-semibold rounded-full bg-red-100 text-red-800">
                          Sans gluten
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {/* <button
                    onClick={() => onEditOpen(item)}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    <Edit className="h-5 w-5" />
                  </button> */}
                    <button
                      onClick={() => onDeleteOpen(item)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
