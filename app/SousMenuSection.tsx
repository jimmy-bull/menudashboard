import { Edit, Plus, Search, Trash } from "lucide-react";
import Image from "next/image";
import { SousMenu, Categorie } from "./types";

interface Props {
  sousMenus: SousMenu[];
  sousMenuForm: Partial<SousMenu>;
  categories: Categorie[];
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  onAddOpen: () => void;
  onEditOpen: (sousMenu: SousMenu) => void;
  onDeleteOpen: (sousMenu: SousMenu) => void;
}

export default function SousMenuSection({
  sousMenus,
  sousMenuForm,
  categories,
  searchTerm,
  setSearchTerm,
  onAddOpen,
  onEditOpen,
  onDeleteOpen,
}: Props) {
  let filteredSousMenus;
  if (sousMenus !== undefined && sousMenus.length > 0) {
    filteredSousMenus = sousMenus.filter(
      (item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Sous-Menus</h1>
        <button
          onClick={onAddOpen}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Plus className="-ml-1 mr-2 h-5 w-5" />
          Ajouter un sous-menu
        </button>
      </div>

      {sousMenus !== undefined && sousMenus.length > 0 && (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredSousMenus !== undefined &&
            filteredSousMenus.map((item) => (
              <div
                key={item.id}
                className="bg-white overflow-hidden shadow rounded-lg"
              >
                <div className="p-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">
                      {item.name}
                    </h3>
                    <div className="ml-2 flex-shrink-0 flex">
                      <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {categories.find((c) => c.nom === item.category)?.nom}
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-gray-500">
                    {item.description}
                  </p>
                  <p className="mt-4 text-lg font-semibold text-gray-900">
                    {item.price} €
                  </p>
                  {item.image_path && (
                    <div className="mt-4">
                      <Image
                        src={item.image_path}
                        alt={item.name}
                        className="h-32 w-full object-cover rounded-md"
                        width={200}
                        height={150}
                      />
                    </div>
                  )}
                </div>
                <div className="bg-gray-50 px-5 py-3 flex justify-end">
                  {/* <button onClick={() => onEditOpen(item)} className="text-indigo-600 hover:text-indigo-900 mr-4">
            <Edit className="h-5 w-5" />
          </button> */}
                  <button
                    onClick={() => onDeleteOpen(item)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
