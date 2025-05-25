"use client";

import { useState, useEffect } from "react";
import {
  Menu,
  Utensils,
  List,
  Plus,
  Edit,
  Trash,
  Search,
  Upload,
  X,
  Save,
  Calendar,
  LogOut,
  Loader,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import MenuSection from "./MenuSection";
import SousMenuSection from "./SousMenuSection";
import WeeklyMenuSection from "./WeeklyMenuSection";
import { Gastronomie, Menu as MenuType, SousMenu, WeeklyItem } from "./types";
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Formik, Form, Field, ErrorMessage } from "formik";

import * as yup from "yup";
type FormValues = {
  name: string;
  gastronomy: string;
  price_per_person: number;
  min_people: number;
  description?: string;
};

interface SignatureData {
  signature: string;
  timestamp: number;
  api_key: string;
  cloud_name: string;
}

interface Props {
  gastronomies: { id: string; nom: string }[];
  addMenu: (data: FormValues) => void;
  setShowAddMenuModal: (show: boolean) => void;
}

export default function Dashboard() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [single_file, set_single_file] = useState<File>(); //

  const schema = yup.object().shape({
    name: yup
      .string()
      .required("Le nom est requis")
      .max(255, "Le nom ne peut dépasser 255 caractères"),
    gastronomie_id: yup.string().required("La gastronomie est requise"),
    price_per_person: yup
      .number()
      .typeError("Le prix doit être un nombre")
      .required("Le prix est requis")
      .positive("Le prix doit être positif"),
    min_people: yup
      .number()
      .typeError("Le nombre de personnes doit être un entier")
      .required("Le nombre de personnes est requis")
      .integer("Le nombre de personnes doit être un entier")
      .min(1, "Au moins 1 personne"),
    description: yup.string().nullable(),
  });

  useEffect(() => {
    // Vérifier si l'utilisateur est authentifié
    const checkAuth = () => {
      if (typeof window !== "undefined") {
        const authStatus = localStorage.getItem("isAuthenticated");
        if (authStatus !== "true") {
          router.push("/login");
        } else {
          setIsAuthenticated(true);
        }
        setIsLoading(false);
      }
    };

    // Exécuter la vérification d'authentification
    checkAuth();
  }, [router]);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("isAuthenticated");
    }
    router.push("/login");
  };

  // State for active tab
  const [activeTab, setActiveTab] = useState("menus");

  // State for menu items
  const [menus, setMenus] = useState<any>();

  const [base_uri, set_base_uri] = useState(process.env.NEXT_PUBLIC_BASE_URI);
  // State for sous-menu items
  const [sousMenus, setSousMenus] = useState<SousMenu[]>([]);
  useEffect(() => {
    fetch(base_uri + "/api/menus")
      .then((response) => response.text())
      .then((data) => {
        setMenus(JSON.parse(data));
        // console.log(data)
      })
      .catch((error) => {
        console.error("Error fetching menus:", error);
      });

    fetch(base_uri + "/api/submenus/")
      .then((response) => response.text())
      .then((data) => {
        console.log(JSON.parse(data));
        setSousMenus(JSON.parse(data));
      })
      .catch((error) => {
        console.error("Error fetching menus:", error);
      });

    // Fetch weekly items from backend
    fetch(base_uri + "/api/weekly-items/")
      .then((response) => response.json())
      .then((data) => {
        setWeeklyMenuItems(data);
      })
      .catch((error) => {
        console.error("Error fetching weekly items:", error);
      });
  }, []);

  // State for weekly menu items
  const [weeklyMenuItems, setWeeklyMenuItems] = useState<WeeklyItem[]>([]);

  // State for gastronomies
  const [gastronomies, setGastronomies] = useState([
    { id: 1, nom: "Gastronomie Thaïlandaise" },
    { id: 2, nom: "Gastronomie Chinoise" },
  ]);

  // State for categories
  const [categories, setCategories] = useState([
    { id: 1, nom: "Entrées / Potages" },
    { id: 2, nom: "Salades / Légumes" },
    { id: 3, nom: "Poissons / Crustacés" },
    { id: 4, nom: "Volailles / Viandes" },
    { id: 5, nom: "Riz et Nouilles" },
  ]);

  // State for modals
  const [showAddMenuModal, setShowAddMenuModal] = useState(false);
  const [showEditMenuModal, setShowEditMenuModal] = useState(false);
  const [showDeleteMenuModal, setShowDeleteMenuModal] = useState(false);
  const [showAddSousMenuModal, setShowAddSousMenuModal] = useState(false);
  const [showEditSousMenuModal, setShowEditSousMenuModal] = useState(false);
  const [showDeleteSousMenuModal, setShowDeleteSousMenuModal] = useState(false);
  const [showAddWeeklyMenuItemModal, setShowAddWeeklyMenuItemModal] =
    useState(false);
  const [showEditWeeklyMenuItemModal, setShowEditWeeklyMenuItemModal] =
    useState(false);
  const [showDeleteWeeklyMenuItemModal, setShowDeleteWeeklyMenuItemModal] =
    useState(false);
  const [showDeleteAllWeeklyMenuModal, setShowDeleteAllWeeklyMenuModal] =
    useState(false);
  // State for confirmation modal
  const [showConfirmDeleteAllModal, setShowConfirmDeleteAllModal] = useState(false);

  // State for current item being edited or deleted
  const [currentMenu, setCurrentMenu] = useState<MenuType | any>(null);
  // const [currentSousMenu, setCurrentSousMenu] = useState(null);
  const [currentSousMenu, setCurrentSousMenu] = useState<SousMenu | null>(null);
  const [currentWeeklyMenuItem, setCurrentWeeklyMenuItem] =
    useState<WeeklyItem | null>(null);

  // State for form inputs
  const [menuForm, setMenuForm] = useState({
    name: "",
    gastronomy: "",
    price_per_person: 0,
    min_people: 2,
    description: "",
  });

  const [sousMenuForm, setSousMenuForm] = useState({
    name: "",
    description: "",
    price: 0,
    image_path: "",
    category: "",
    gastronomy: "",
  });

  const [weeklyMenuItemForm, setWeeklyMenuItemForm] = useState({
    code: "",
    nom: "",
    description: "",
    prix: 0,
    categorie: "entree",
    vegetarien: false,
    sans_gluten: false,
  });

  // State for search
  const [searchTerm, setSearchTerm] = useState("");
  const [weeklyMenuSearchTerm, setWeeklyMenuSearchTerm] = useState("");

  // Function to handle menu form changes price_per_person
  // const handleMenuFormChange = (e: any) => {
  //   const { name, value } = e.target;
  //   setMenuForm({
  //     ...menuForm,
  //     [name]:
  //       name === "personnes_min" || name === "personnes_min"
  //         ? Number.parseFloat(value)
  //         : value,
  //   });
  // };

  // Function to handle sous-menu form changes
  // const handleSousMenuFormChange = (e: any) => {
  //   const { name, value } = e.target;
  //   setSousMenuForm({
  //     ...sousMenuForm,
  //     [name]: name === "prix" ? Number.parseFloat(value) : value,
  //   });
  // };

  // Function to handle weekly menu item form changes
  const handleWeeklyMenuItemFormChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setWeeklyMenuItemForm({
      ...weeklyMenuItemForm,
      [name]:
        type === "checkbox"
          ? checked
          : type === "number"
          ? Number.parseFloat(value)
          : value,
    });
  };

  const addMenu = (values: FormValues) => {
    const newMenu = {
      id: menus.length + 1,
      name: values.name,
      gastronomy: values.gastronomy,
      price_per_person: values.price_per_person,
      min_people: values.min_people,
      description: values.description || "",
    };
    setMenus([...menus, newMenu]);
    console.log(newMenu);

    fetch(
      `${base_uri}/api/add_menu/${encodeURIComponent(
        newMenu.name
      )}/${encodeURIComponent(newMenu.gastronomy)}/${
        newMenu.price_per_person
      }/${newMenu.min_people}/${encodeURIComponent(newMenu.description)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    )
      .then((response) => response.text())
      .then((data) => {
        console.log(data);
        setShowAddMenuModal(false);
      })
      .catch((error) => {
        console.error("Error adding menu:", error);
      });
  };

  const initialValues: FormValues = {
    name: "",
    gastronomy: "",
    price_per_person: 0,
    min_people: 1,
    description: "",
  };

  // Function to edit a menu
  const editMenu = () => {
    if (!currentMenu) return;
    const updatedMenus = menus.map((menu: any) =>
      menu.id === currentMenu.id ? { ...menu, ...menuForm } : menu
    );
    setMenus(updatedMenus);
    setShowEditMenuModal(false);
  };

  // Function to delete a menu
  const deleteMenu = () => {
    if (!currentMenu) return;
    if (menus !== undefined) {
      const updatedMenus = menus.filter(
        (menu: any) => menu.id !== currentMenu.id
      );
      setMenus(updatedMenus);
      setShowDeleteMenuModal(false);
      console.log(currentMenu.id);

      fetch(base_uri + "/api/delete_menu/" + currentMenu.id)
        .then((response) => response.text())
        .then((data) => {
          console.log(data);
        })
        .catch((error) => {
          console.error("Error fetching menus:", error);
        });
    }
  };

  // Function to add a new sous-menu
  //   const addSousMenu = () => {
  //     const newSousMenu = {
  //       id: sousMenus.length + 1,
  //       ...sousMenuForm,
  //     };
  //     setSousMenus([...sousMenus, newSousMenu]);
  //     console.log(newSousMenu);
  //     setShowAddSousMenuModal(false);
  //     setSousMenuForm({
  //       name: "",
  //       description: "",
  //       price: 0,
  //       image_path: "",
  //       category: "",
  //       gastronomy: "",
  //     });
  //   };

  // Function to handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // In a real application, this would handle file upload to a server
    // For this demo, we'll just set the image name
    const file = e.target.files?.[0];
    if (file) {
      setSousMenuForm({
        ...sousMenuForm,
        image_path: file.name,
      });
    }
    if (!e.target.files) return;
    set_single_file(e.target.files[0]);
  };

  async function getSignature(): Promise<SignatureData> {
    const response = await fetch(base_uri + "/api/generatesignature", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}), // If you have any data to send, include it here
    });

    if (!response.ok) {
      throw new Error("Failed to fetch signature");
    }

    return (await response.json()) as SignatureData;
  }

  async function uploadToCloudinary(file: File): Promise<string> {
    const signatureData = await getSignature();

    return new Promise<string>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open(
        "POST",
        `https://api.cloudinary.com/v1_1/${signatureData.cloud_name}/auto/upload`
      );

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          console.log((event.loaded / event.total) * 100);
        }
      };

      // Créer un objet FormData
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "iwafolder");

      // Envoyer à Cloudinary
      xhr.onload = () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          resolve(response.secure_url); // Resolve the Promise with the URL
        } else {
          reject(new Error(`Failed to upload file: ${file.name}`));
        }
      };
      xhr.onerror = () => {
        reject(new Error(`Failed to upload file: ${file.name}`));
      };
      xhr.send(formData);
    });
  }

  const [adding_sub_menu_loading, set_adding_sub_menu_loading] =
    useState(false);
  // Ajout d'un sous-menu
  const addSousMenu = async (values: SousMenuFormValues) => {
    let url = "";
    set_adding_sub_menu_loading(true);

    try {
      if (single_file !== undefined) {
        try {
          url = await uploadToCloudinary(single_file);
          console.log("Uploaded URL:", url);
        } catch (error) {
          console.error("Upload failed:", error);
        }
      }
      const newSous = {
        id: sousMenus.length + 1,
        name: values.name,
        category: values.category,
        price: values.price,
        description: values.description || "",
        image_path: values.image_path || url,
        gastronomy: values.gastronomy,
      };
      setSousMenus([...sousMenus, newSous]);
      const endpoint = `${base_uri}/api/submenus/add_sous_menu`;
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            name: newSous.name,
            category: newSous.category,
            price: newSous.price,
            description: newSous.description,
            gastronomy: newSous.gastronomy,
            image_path: newSous.image_path,
          }),
        });

        if (!response.ok) {
          alert("Erreur lors de l'ajout du sous-menu");
          throw new Error(`Erreur API: ${response.status}`);
        }

        setShowAddSousMenuModal(false);
        setSousMenuForm({
          name: "",
          description: "",
          price: 0,
          image_path: "",
          category: "",
          gastronomy: "",
        });
      } catch (fetchError) {
        console.error("Erreur lors de l'appel API:", fetchError);
        // Retirer le sous-menu ajouté prématurément en cas d'erreur API
        setSousMenus((prevSousMenus) =>
          prevSousMenus.filter((item) => item.id !== sousMenus.length + 1)
        );
        throw fetchError; // Relancer l'erreur pour être capturée par le try/catch parentF
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout du sous-menu:", error);
      alert("Erreur lors de l'ajout du sous-menu");
      // Vous pourriez ajouter ici un état pour afficher un message d'erreur
      // setErrorMessage("Échec de l'ajout du sous-menu. Veuillez réessayer.");
    } finally {
      set_adding_sub_menu_loading(false);
    }
  };

  // Function to edit a sous-menu
  const editSousMenu = () => {
    // if (!currentSousMenu) return;
    // const updatedSousMenus = sousMenus.map((sousMenu) =>
    //   sousMenu.id === currentSousMenu.id
    //     ? { ...sousMenu, ...sousMenuForm }
    //     : sousMenu
    // );
    // setSousMenus(updatedSousMenus);
    // setShowEditSousMenuModal(false);
  };

  // Function to delete a sous-menu
  const deleteSousMenu = () => {
    if (!currentSousMenu) return;
    const updatedSousMenus = sousMenus.filter(
      (sousMenu) => sousMenu.id !== currentSousMenu.id
    );
    setSousMenus(updatedSousMenus);
    setShowDeleteSousMenuModal(false);
    // console.log(currentSousMenu.id);

    fetch(base_uri + "/api/submenus/delete_sub_menu/" + currentSousMenu.id, {
      method: "DELETE",
    })
      .then((response) => response.text())
      .then((data) => {
        console.log(data);
      })
      .catch((error) => {
        console.error("Error fetching menus:", error);
      });
  };

  // Loader state for weekly menu item creation
  const [isAddingWeeklyMenuItem, setIsAddingWeeklyMenuItem] = useState(false);

  // Function to add a new weekly menu item
  const addWeeklyMenuItem = async (values: typeof weeklyMenuItemForm) => {
    const newWeeklyMenuItem = {
      code: values.code,
      nom: values.nom,
      description: values.description,
      prix: values.prix,
      categorie: values.categorie,
      vegetarien: values.vegetarien,
      epice: values.sans_gluten,
    };
    setIsAddingWeeklyMenuItem(true);
    try {
      const response = await fetch(
        base_uri + "/api/weekly-items/create-weekly-item",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(newWeeklyMenuItem),
        }
      );
      const data = await response.json();
      if (response.ok && data.success) {
        setWeeklyMenuItems((prev) => [...prev, data.data]);
        setShowAddWeeklyMenuItemModal(false);
        setWeeklyMenuItemForm({
          code: "",
          nom: "",
          description: "",
          prix: 0,
          categorie: "entree",
          vegetarien: false,
          sans_gluten: false,
        });
      } else {
        alert(
          "Erreur lors de l'ajout du plat: " +
            (data.message || JSON.stringify(data.errors))
        );
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout du plat:", error);
      alert("Erreur lors de l'ajout du plat");
    } finally {
      setIsAddingWeeklyMenuItem(false);
    }
  };

  // Function to edit a weekly menu item
  const editWeeklyMenuItem = () => {
    // if (!currentWeeklyMenuItem) return;
    // const updatedWeeklyMenuItems = weeklyMenuItems.map((item) =>
    //   item.id === currentWeeklyMenuItem.id
    //     ? { ...item, ...weeklyMenuItemForm }
    //     : item
    // );
    // setWeeklyMenuItems(updatedWeeklyMenuItems);
    // setShowEditWeeklyMenuItemModal(false);
  };

  // Loader states for deletion
  const [isDeletingWeeklyMenuItem, setIsDeletingWeeklyMenuItem] =
    useState(false);
  const [isDeletingAllWeeklyMenuItems, setIsDeletingAllWeeklyMenuItems] =
    useState(false);

  // Function to delete a weekly menu item
  const deleteWeeklyMenuItem = async () => {
    if (!currentWeeklyMenuItem) return;
    setIsDeletingWeeklyMenuItem(true);
    try {
      const response = await fetch(
        base_uri +
          "/api/weekly-items/delete-weekly-item/" +
          currentWeeklyMenuItem.id,
        { method: "DELETE" }
      );
      const data = await response.json();
      if (response.ok && data.success) {
        setWeeklyMenuItems((prev) =>
          prev.filter((item) => item.id !== currentWeeklyMenuItem.id)
        );
        setShowDeleteWeeklyMenuItemModal(false);
      } else {
        alert("Erreur lors de la suppression: " + (data.message || ""));
      }
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      alert("Erreur lors de la suppression");
    } finally {
      setIsDeletingWeeklyMenuItem(false);
    }
  };

  // Function to delete all weekly menu items
  const deleteAllWeeklyMenuItems = async () => {
    setIsDeletingAllWeeklyMenuItems(true);
    try {
      const response = await fetch(
        base_uri + "/api/weekly-items/delete-all-weekly-items",
        {
          method: "POST",
        }
      );
      const data = await response.json();
      if (response.ok && data.success) {
        setWeeklyMenuItems([]);
        setShowDeleteAllWeeklyMenuModal(false);
      } else {
        alert(
          "Erreur lors de la suppression de tous les plats: " +
            (data.message || "")
        );
      }
    } catch (error) {
      console.error("Erreur lors de la suppression de tous les plats:", error);
      alert("Erreur lors de la suppression de tous les plats");
    } finally {
      setIsDeletingAllWeeklyMenuItems(false);
    }
  };

  // Function to open edit menu modal
  const openEditMenuModal = (menu: any) => {
    setCurrentMenu(menu);
    // setMenuForm({
    //   nom: menu.nom,
    //   gastronomy: menu.gastronom,
    //   prix_par_personne: menu.prix_par_personne,
    //   personnes_min: menu.personnes_min,
    //   description: menu.description,
    // });
    setShowEditMenuModal(true);
  };

  // Function to open delete menu modal
  const openDeleteMenuModal = (menu: any) => {
    setCurrentMenu(menu);
    setShowDeleteMenuModal(true);
  };

  // Function to open edit sous-menu modal
  const openEditSousMenuModal = (sousMenu: any) => {
    setCurrentSousMenu(sousMenu);
    // setSousMenuForm({
    //   name: sousMenu.name,
    //   description: sousMenu.description,
    //   price: sousMenu.price,
    //   image_path: sousMenu.image_nom,
    // });
    setShowEditSousMenuModal(true);
  };

  // Function to open delete sous-menu modal
  const openDeleteSousMenuModal = (sousMenu: any) => {
    setCurrentSousMenu(sousMenu);
    setShowDeleteSousMenuModal(true);
  };

  // Function to open edit weekly menu item modal
  const openEditWeeklyMenuItemModal = (item: any) => {
    setCurrentWeeklyMenuItem(item);
    setWeeklyMenuItemForm({
      code: item.code,
      nom: item.nom,
      description: item.description,
      prix: item.prix,
      categorie: item.categorie,
      vegetarien: item.vegetarien,
      sans_gluten: item.sans_gluten,
    });
    setShowEditWeeklyMenuItemModal(true);
  };

  // Function to open delete weekly menu item modal
  const openDeleteWeeklyMenuItemModal = (item: any) => {
    setCurrentWeeklyMenuItem(item);
    setShowDeleteWeeklyMenuItemModal(true);
  };

  // Filter menus based on search term
  // const filteredMenus = menus.filter(
  //   (menu) =>
  //     menu.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     menu.description.toLowerCase().includes(searchTerm.toLowerCase())
  // );

  // Filter sous-menus based on search term
  const filteredSousMenus = sousMenus.filter(
    (sousMenu) =>
      sousMenu.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sousMenu.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter weekly menu items based on search term
  const filteredWeeklyMenuItems = weeklyMenuItems.filter(
    (item) =>
      item.code.toLowerCase().includes(weeklyMenuSearchTerm.toLowerCase()) ||
      item.nom.toLowerCase().includes(weeklyMenuSearchTerm.toLowerCase()) ||
      (item.description &&
        item.description
          .toLowerCase()
          .includes(weeklyMenuSearchTerm.toLowerCase()))
  );

  // Get entrées and plats for weekly menu display
  const entrees = weeklyMenuItems.filter((item) => item.categorie === "entree");
  const plats = weeklyMenuItems.filter((item) => item.categorie === "plat");

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Ne rien afficher pendant la vérification d'authentification
  }

  // Intégration du formulaire et validation
  const validationSchema = yup.object({
    name: yup
      .string()
      .required("Le nom est requis")
      .max(255, "Le nom ne peut dépasser 255 caractères"),
    gastronomy: yup.string().required("La gastronomie est requise"),
    price_per_person: yup
      .number()
      .typeError("Le prix doit être un nombre")
      .required("Le prix est requis")
      .positive("Le prix doit être positif"),
    min_people: yup
      .number()
      .typeError("Le nombre de personnes doit être un entier")
      .required("Le nombre de personnes est requis")
      .integer("Le nombre de personnes doit être un entier")
      .min(1, "Au moins 1 personne"),
    description: yup.string().nullable(),
  });

  const sousMenuValidationSchema = yup.object({
    name: yup
      .string()
      .required("Le nom du sous-menu est requis")
      .max(255, "Le nom ne peut dépasser 255 caractères"),
    category: yup.string().required("La catégorie est requise"),
    gastronomy: yup.string().required("La gastronomie est requise"),
    price: yup
      .number()
      .typeError("Le prix doit être un nombre")
      .required("Le prix est requis")
      .positive("Le prix doit être positif"),
    description: yup.string().nullable(),
    image_path: yup.string().nullable(),
  });
  type SousMenuFormValues = yup.InferType<typeof sousMenuValidationSchema>;

  // Validation schema for weekly menu item
  const weeklyMenuItemValidationSchema = yup.object({
    code: yup
      .string()
      .required("Le code est requis")
      .max(255, "Le code ne peut dépasser 255 caractères"),
    nom: yup
      .string()
      .required("Le nom est requis")
      .max(255, "Le nom ne peut dépasser 255 caractères"),
    description: yup.string().nullable(),
    prix: yup
      .number()
      .typeError("Le prix doit être un nombre")
      .required("Le prix est requis")
      .positive("Le prix doit être positif"),
    categorie: yup.string().required("La catégorie est requise"),
    vegetarien: yup.boolean().required(),
    sans_gluten: yup.boolean().required(),
  });

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                {/* <Utensils className="h-8 w-8 text-indigo-600" /> */}
                <span className="ml-2 text-xl font-bold text-gray-900">
                  Ming Xuan Dashboard
                </span>
              </div>
            </div>
            <div className="flex items-center">
              <div className="ml-4 flex items-center md:ml-6">
                <button
                  onClick={handleLogout}
                  className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center"
                >
                  <LogOut className="h-6 w-6 mr-1" />
                  <span className="text-sm">Déconnexion</span>
                </button>
                <div className="ml-3 relative">
                  <div>
                    <button
                      className="max-w-xs bg-white flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      id="user-menu"
                      aria-expanded="false"
                      aria-haspopup="true"
                    >
                      <span className="sr-only">Open user menu</span>
                      <Image
                        className="h-8 w-8 rounded-full"
                        src="/LogomingXuancopy.png?height=32&width=32"
                        alt="User"
                        width={32}
                        height={32}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-md h-screen">
          <div className="pt-5 pb-4">
            <div className="px-4">
              <h2 className="text-lg font-medium text-gray-900">Ming Xuan Dashboard</h2>
            </div>
            <nav className="mt-5 px-2">
              <button
                onClick={() => setActiveTab("menus")}
                className={`group flex items-center px-2 py-2 text-base font-medium rounded-md w-full ${
                  activeTab === "menus"
                    ? "bg-indigo-100 text-indigo-600"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Menu
                  className={`mr-3 h-5 w-5 ${
                    activeTab === "menus"
                      ? "text-indigo-500"
                      : "text-gray-400 group-hover:text-gray-500"
                  }`}
                />
                Menus
              </button>
              <button
                onClick={() => setActiveTab("sous-menus")}
                className={`group flex items-center px-2 py-2 text-base font-medium rounded-md w-full ${
                  activeTab === "sous-menus"
                    ? "bg-indigo-100 text-indigo-600"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <List
                  className={`mr-3 h-5 w-5 ${
                    activeTab === "sous-menus"
                      ? "text-indigo-500"
                      : "text-gray-400 group-hover:text-gray-500"
                  }`}
                />
                Sous-Menus
              </button>
              <button
                onClick={() => setActiveTab("weekly-menu")}
                className={`group flex items-center px-2 py-2 text-base font-medium rounded-md w-full ${
                  activeTab === "weekly-menu"
                    ? "bg-indigo-100 text-indigo-600"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Calendar
                  className={`mr-3 h-5 w-5 ${
                    activeTab === "weekly-menu"
                      ? "text-indigo-500"
                      : "text-gray-400 group-hover:text-gray-500"
                  }`}
                />
                Menu de la semaine
              </button>
            </nav>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-auto p-8">
          {/* Menus Tab */}
          {activeTab === "menus" && (
            <MenuSection
              menus={menus}
              menuForm={menuForm}
              gastronomies={gastronomies}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              // setMenuForm={setMenuForm}
              onAdd={addMenu}
              onEdit={editMenu}
              onDelete={deleteMenu}
              onAddOpen={() => setShowAddMenuModal(true)}
              onEditOpen={openEditMenuModal}
              onDeleteOpen={openDeleteMenuModal}
            />
          )}

          {/* Sous-Menus Tab */}
          {activeTab === "sous-menus" && sousMenus !== undefined && (
            <SousMenuSection
              sousMenus={sousMenus}
              sousMenuForm={sousMenuForm}
              categories={categories}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              onAddOpen={() => setShowAddSousMenuModal(true)}
              onEditOpen={openEditSousMenuModal}
              onDeleteOpen={openDeleteSousMenuModal}
            />
          )}

          {/* Weekly Menu Tab */}
          {activeTab === "weekly-menu" && (
            <WeeklyMenuSection
              weeklyMenuItems={weeklyMenuItems}
              searchTerm={weeklyMenuSearchTerm}
              setSearchTerm={setWeeklyMenuSearchTerm}
              onAddOpen={() => setShowAddWeeklyMenuItemModal(true)}
              onEditOpen={openEditWeeklyMenuItemModal}
              onDeleteOpen={openDeleteWeeklyMenuItemModal}
              onDeleteAll={() => setShowConfirmDeleteAllModal(true)}
            />
          )}
        </div>
      </div>

      {/* Add Menu Modal */}

      {showAddMenuModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>

            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={(values, { setSubmitting }) => {
                addMenu(values);
                setSubmitting(false);
              }}
            >
              {({ isSubmitting }) => (
                <Form className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                  <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <div className="sm:flex sm:items-start">
                      <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                          Ajouter un menu
                        </h3>
                        <div className="mt-4 space-y-4">
                          {/* Nom */}
                          <div>
                            <label
                              htmlFor="name"
                              className="block text-sm font-medium text-gray-700"
                            >
                              Nom
                            </label>
                            <Field
                              name="name"
                              id="name"
                              className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                            />
                            <ErrorMessage
                              component="p"
                              name="name"
                              className="text-sm text-red-600"
                            />
                          </div>

                          {/* Gastronomie */}
                          <div>
                            <label
                              htmlFor="gastronomy"
                              className="block text-sm font-medium text-gray-700"
                            >
                              Gastronomie
                            </label>
                            <Field
                              as="select"
                              name="gastronomy"
                              id="gastronomy"
                              className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            >
                              <option value="">Sélectionnez</option>
                              {gastronomies.map((g) => (
                                <option key={g.id} value={g.nom}>
                                  {g.nom}
                                </option>
                              ))}
                            </Field>
                            <ErrorMessage
                              component="p"
                              name="gastronomy"
                              className="text-sm text-red-600"
                            />
                          </div>

                          {/* Prix par personne */}
                          <div>
                            <label
                              htmlFor="price_per_person"
                              className="block text-sm font-medium text-gray-700"
                            >
                              Prix par personne (€)
                            </label>
                            <Field
                              name="price_per_person"
                              id="price_per_person"
                              type="number"
                              step="0.01"
                              className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                            />
                            <ErrorMessage
                              component="p"
                              name="price_per_person"
                              className="text-sm text-red-600"
                            />
                          </div>

                          {/* Personnes minimum */}
                          <div>
                            <label
                              htmlFor="min_people"
                              className="block text-sm font-medium text-gray-700"
                            >
                              Personnes minimum
                            </label>
                            <Field
                              name="min_people"
                              id="min_people"
                              type="number"
                              className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                            />
                            <ErrorMessage
                              component="p"
                              name="min_people"
                              className="text-sm text-red-600"
                            />
                          </div>

                          {/* Description */}
                          <div>
                            <label
                              htmlFor="description"
                              className="block text-sm font-medium text-gray-700"
                            >
                              Description
                            </label>
                            <Field
                              as="textarea"
                              name="description"
                              id="description"
                              rows={3}
                              className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                            />
                            <ErrorMessage
                              component="p"
                              name="description"
                              className="text-sm text-red-600"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                       Ajouter
                    </button>
                    <button
                      type="button"
                      className="mt-3 inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                      onClick={() => setShowAddMenuModal(false)}
                    >
                      Annuler
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      )}

      {/* Edit Menu Modal */}
      {/* {showEditMenuModal && currentMenu && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Modifier le menu
                    </h3>
                    <div className="mt-4">
                      <div className="mb-4">
                        <label
                          htmlFor="edit-nom"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Nom
                        </label>
                        <input
                          type="text"
                          name="nom"
                          id="edit-nom"
                          className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          value={menuForm.nom}
                          onChange={handleMenuFormChange}
                        />
                      </div>
                      <div className="mb-4">
                        <label
                          htmlFor="edit-gastronomie_id"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Gastronomie
                        </label>
                        <select
                          id="edit-gastronomie_id"
                          name="gastronomie_id"
                          className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          value={menuForm.gastronomie_id}
                          onChange={handleMenuFormChange}
                        >
                          {gastronomies.map((gastronomie) => (
                            <option key={gastronomie.id} value={gastronomie.id}>
                              {gastronomie.nom}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="mb-4">
                        <label
                          htmlFor="edit-prix_par_personne"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Prix par personne (€)
                        </label>
                        <input
                          type="number"
                          name="prix_par_personne"
                          id="edit-prix_par_personne"
                          className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          value={menuForm.prix_par_personne}
                          onChange={handleMenuFormChange}
                          step="0.01"
                        />
                      </div>
                      <div className="mb-4">
                        <label
                          htmlFor="edit-personnes_min"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Personnes minimum
                        </label>
                        <input
                          type="number"
                          name="personnes_min"
                          id="edit-personnes_min"
                          className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          value={menuForm.personnes_min}
                          onChange={handleMenuFormChange}
                        />
                      </div>
                      <div className="mb-4">
                        <label
                          htmlFor="edit-description"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Description
                        </label>
                        <textarea
                          id="edit-description"
                          name="description"
                          rows={3}
                          className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          value={menuForm.description}
                          onChange={handleMenuFormChange}
                        ></textarea>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={editMenu}
                >
                  Enregistrer
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowEditMenuModal(false)}
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )} */}

      {/* Delete Menu Modal */}
      {showDeleteMenuModal && currentMenu && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <X className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Supprimer le menu
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Êtes-vous sûr de vouloir supprimer le menu "
                        {currentMenu.name}" ? Cette action ne peut pas être
                        annulée.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={deleteMenu}
                >
                  Supprimer
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowDeleteMenuModal(false)}
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Sous-Menu Modal */}
      {showAddSousMenuModal && (
        <Formik
          initialValues={{
            name: "",
            category: "",
            price: 0,
            description: "",
            image_path: "",
            gastronomy: "",
          }}
          validationSchema={sousMenuValidationSchema}
          onSubmit={(values, { setSubmitting }) => {
            addSousMenu(values);
            setSubmitting(false);
          }}
          F
        >
          {({ isSubmitting }) => (
            <Form className="fixed z-10 inset-0 overflow-y-auto">
              <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div
                  className="fixed inset-0 transition-opacity"
                  aria-hidden="true"
                >
                  <div className="absolute inset-0 bg-gray-500 opacity-75" />
                </div>
                <span
                  className="hidden sm:inline-block sm:align-middle sm:h-screen"
                  aria-hidden="true"
                >
                  &#8203;
                </span>
                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                  <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <div className="sm:flex sm:items-start">
                      <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                          Ajouter un sous-menu
                        </h3>
                        <div className="mt-4 space-y-4">
                          {/* Nom */}
                          <div>
                            <label
                              htmlFor="name"
                              className="block text-sm font-medium text-gray-700"
                            >
                              Nom
                            </label>
                            <Field
                              id="name"
                              name="name"
                              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-indigo-500 focus:border-indigo-500"
                            />
                            <ErrorMessage
                              name="name"
                              component="p"
                              className="text-sm text-red-600"
                            />
                          </div>
                          {/* Catégorie */}
                          <div>
                            <label
                              htmlFor="category"
                              className="block text-sm font-medium text-gray-700"
                            >
                              Catégorie
                            </label>
                            <Field
                              as="select"
                              id="category"
                              name="category"
                              className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            >
                              <option value="">Sélectionnez</option>
                              {categories.map((c) => (
                                <option key={c.id} value={c.nom}>
                                  {c.nom}
                                </option>
                              ))}
                            </Field>
                            <ErrorMessage
                              name="category"
                              component="p"
                              className="text-sm text-red-600"
                            />
                          </div>

                          {/* Gastronomie */}
                          <div>
                            <label
                              htmlFor="gastronomy"
                              className="block text-sm font-medium text-gray-700"
                            >
                              Gastronomie
                            </label>
                            <Field
                              as="select"
                              id="gastronomy"
                              name="gastronomy"
                              className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            >
                              <option value="">Sélectionnez</option>
                              {gastronomies.map((c) => (
                                <option key={c.id} value={c.nom}>
                                  {c.nom}
                                </option>
                              ))}
                            </Field>
                            <ErrorMessage
                              name="gastronomy"
                              component="p"
                              className="text-sm text-red-600"
                            />
                          </div>
                          {/* Prix */}
                          <div>
                            <label
                              htmlFor="price"
                              className="block text-sm font-medium text-gray-700"
                            >
                              Prix (€)
                            </label>
                            <Field
                              id="price"
                              name="price"
                              type="number"
                              step="0.01"
                              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-indigo-500 focus:border-indigo-500"
                            />
                            <ErrorMessage
                              name="price"
                              component="p"
                              className="text-sm text-red-600"
                            />
                          </div>
                          {/* Description */}
                          <div>
                            <label
                              htmlFor="description"
                              className="block text-sm font-medium text-gray-700"
                            >
                              Description
                            </label>
                            <Field
                              as="textarea"
                              id="description"
                              name="description"
                              rows={3}
                              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-indigo-500 focus:border-indigo-500"
                            />
                            <ErrorMessage
                              name="description"
                              component="p"
                              className="text-sm text-red-600"
                            />
                          </div>
                          {/* Image */}
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">
                              Image
                            </label>
                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                              <div className="space-y-1 text-center">
                                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                <div className="flex text-sm text-gray-600">
                                  <label
                                    htmlFor="edit-file-upload"
                                    className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                                  >
                                    <span>Télécharger un fichier</span>
                                    <input
                                      id="edit-file-upload"
                                      name="image_path"
                                      type="file"
                                      className="sr-only"
                                      onChange={handleImageUpload}
                                      accept="image/*"
                                    />
                                  </label>
                                  <ErrorMessage
                                    name="image_path"
                                    component="p"
                                    className="text-sm text-red-600"
                                  />
                                  {/* <p className="pl-1">ou glisser-déposer</p> */}
                                </div>
                                <p className="text-xs text-gray-500">
                                  PNG, JPG, GIF jusqu'à 10MB
                                </p>
                                {sousMenuForm.image_path && (
                                  <p className="text-xs text-indigo-500">
                                    {sousMenuForm.image_path}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="ml-3 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:w-auto sm:text-sm"
                    >
                      {adding_sub_menu_loading ? (
                        <Loader className="h-4 w-4 mr-2" />
                      ) : (
                        <Plus className="h-4 w-4 mr-2" />
                      )}
                      {adding_sub_menu_loading
                        ? "Ajout en cours..."
                        : "Ajouter"}
                    </button>
                    <button
                      type="button"
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                      onClick={() => setShowAddSousMenuModal(false)}
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              </div>
            </Form>
          )}
        </Formik>
      )}

      {/* Delete Sous-Menu Modal */}
      {showDeleteSousMenuModal && currentSousMenu && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <X className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Supprimer le sous-menu
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Êtes-vous sûr de vouloir supprimer le sous-menu "
                        {currentSousMenu.name}" ? Cette action ne peut pas être
                        annulée.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={deleteSousMenu}
                >
                  <Trash className="h-4 w-4 mr-2" />
                  Supprimer
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowDeleteSousMenuModal(false)}
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Weekly Menu Item Modal */}
      {showAddWeeklyMenuItemModal && (
        <Formik
          initialValues={weeklyMenuItemForm}
          validationSchema={weeklyMenuItemValidationSchema}
          enableReinitialize
          onSubmit={async (values, { setSubmitting, resetForm }) => {
            await addWeeklyMenuItem(values);
            setSubmitting(false);
            resetForm();
          }}
        >
          {({ isSubmitting, values, handleChange, setFieldValue }) => (
            <Form className="fixed z-10 inset-0 overflow-y-auto">
              <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div
                  className="fixed inset-0 transition-opacity"
                  aria-hidden="true"
                >
                  <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                </div>
                <span
                  className="hidden sm:inline-block sm:align-middle sm:h-screen"
                  aria-hidden="true"
                >
                  &#8203;
                </span>
                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                  <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <div className="sm:flex sm:items-start">
                      <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                          Ajouter un plat au menu de la semaine
                        </h3>
                        <div className="mt-4">
                          <div className="mb-4">
                            <label
                              htmlFor="weekly-menu-code"
                              className="block text-sm font-medium text-gray-700"
                            >
                              Code
                            </label>
                            <Field
                              type="text"
                              name="code"
                              id="weekly-menu-code"
                              className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                              placeholder="Ex: P1, A2, etc."
                            />
                            <ErrorMessage
                              name="code"
                              component="p"
                              className="text-sm text-red-600"
                            />
                          </div>
                          <div className="mb-4">
                            <label
                              htmlFor="weekly-menu-nom"
                              className="block text-sm font-medium text-gray-700"
                            >
                              Nom
                            </label>
                            <Field
                              type="text"
                              name="nom"
                              id="weekly-menu-nom"
                              className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            />
                            <ErrorMessage
                              name="nom"
                              component="p"
                              className="text-sm text-red-600"
                            />
                          </div>
                          <div className="mb-4">
                            <label
                              htmlFor="weekly-menu-categorie"
                              className="block text-sm font-medium text-gray-700"
                            >
                              Catégorie
                            </label>
                            <Field
                              as="select"
                              id="weekly-menu-categorie"
                              name="categorie"
                              className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            >
                              <option value="entree">Entrée</option>
                              <option value="plat">Plat principal</option>
                            </Field>
                            <ErrorMessage
                              name="categorie"
                              component="p"
                              className="text-sm text-red-600"
                            />
                          </div>
                          <div className="mb-4">
                            <label
                              htmlFor="weekly-menu-prix"
                              className="block text-sm font-medium text-gray-700"
                            >
                              Prix (€)
                            </label>
                            <Field
                              type="number"
                              name="prix"
                              id="weekly-menu-prix"
                              className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                              step="0.01"
                            />
                            <ErrorMessage
                              name="prix"
                              component="p"
                              className="text-sm text-red-600"
                            />
                          </div>
                          <div className="mb-4">
                            <label
                              htmlFor="weekly-menu-description"
                              className="block text-sm font-medium text-gray-700"
                            >
                              Description (optionnel)
                            </label>
                            <Field
                              as="textarea"
                              id="weekly-menu-description"
                              name="description"
                              rows={2}
                              className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            />
                            <ErrorMessage
                              name="description"
                              component="p"
                              className="text-sm text-red-600"
                            />
                          </div>
                          <div className="mb-4 flex items-center">
                            <input
                              id="weekly-menu-vegetarien"
                              name="vegetarien"
                              type="checkbox"
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                              // checked={values.vegetarien}
                              onChange={() =>
                                setFieldValue("Végétarien", !values.vegetarien)
                              }
                            />
                            <label
                              htmlFor="weekly-menu-vegetarien"
                              className="ml-2 block text-sm text-gray-900"
                            >
                              Végétarien
                            </label>
                            <ErrorMessage
                              name="vegetarien"
                              component="p"
                              className="text-sm text-red-600 ml-2"
                            />
                          </div>
                          <div className="mb-4 flex items-center">
                            <input
                              id="weekly-menu-sans-gluten"
                              name="sans_gluten"
                              type="checkbox"
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                              // checked={values.sans_gluten}
                              onChange={() =>
                                setFieldValue("Sans gluten", !values.sans_gluten)
                              }
                            />
                            <label
                              htmlFor="weekly-menu-sans-gluten"
                              className="ml-2 block text-sm text-gray-900"
                            >
                              Sans gluten
                            </label>
                            <ErrorMessage
                              name="sans_gluten"
                              component="p"
                              className="text-sm text-red-600 ml-2"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button
                      type="submit"
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                      disabled={isSubmitting || isAddingWeeklyMenuItem}
                    >
                      {isAddingWeeklyMenuItem ? (
                        <Loader className="h-4 w-4 mr-2 animate-spin" />
                      ) : null}
                      Ajouter
                    </button>
                    <button
                      type="button"
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                      onClick={() => setShowAddWeeklyMenuItemModal(false)}
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              </div>
            </Form>
          )}
        </Formik>
      )}

      {/* Edit Weekly Menu Item Modal */}
      {showEditWeeklyMenuItemModal && currentWeeklyMenuItem && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Modifier le plat
                    </h3>
                    <div className="mt-4">
                      <div className="mb-4">
                        <label
                          htmlFor="edit-weekly-menu-code"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Code
                        </label>
                        <input
                          type="text"
                          name="code"
                          id="edit-weekly-menu-code"
                          className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          value={weeklyMenuItemForm.code}
                          onChange={handleWeeklyMenuItemFormChange}
                        />
                      </div>
                      <div className="mb-4">
                        <label
                          htmlFor="edit-weekly-menu-nom"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Nom
                        </label>
                        <input
                          type="text"
                          name="nom"
                          id="edit-weekly-menu-nom"
                          className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          value={weeklyMenuItemForm.nom}
                          onChange={handleWeeklyMenuItemFormChange}
                        />
                      </div>
                      <div className="mb-4">
                        <label
                          htmlFor="edit-weekly-menu-categorie"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Catégorie
                        </label>
                        <select
                          id="edit-weekly-menu-categorie"
                          name="categorie"
                          className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          value={weeklyMenuItemForm.categorie}
                          onChange={handleWeeklyMenuItemFormChange}
                        >
                          <option value="entree">Entrée</option>
                          <option value="plat">Plat principal</option>
                        </select>
                      </div>
                      <div className="mb-4">
                        <label
                          htmlFor="edit-weekly-menu-prix"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Prix (€)
                        </label>
                        <input
                          type="number"
                          name="prix"
                          id="edit-weekly-menu-prix"
                          className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          value={weeklyMenuItemForm.prix}
                          onChange={handleWeeklyMenuItemFormChange}
                          step="0.01"
                        />
                      </div>
                      <div className="mb-4">
                        <label
                          htmlFor="edit-weekly-menu-description"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Description (optionnel)
                        </label>
                        <textarea
                          id="edit-weekly-menu-description"
                          name="description"
                          rows={2}
                          className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          value={weeklyMenuItemForm.description}
                          onChange={handleWeeklyMenuItemFormChange}
                        ></textarea>
                      </div>
                      <div className="mb-4 flex items-center">
                        <input
                          id="edit-weekly-menu-vegetarien"
                          name="vegetarien"
                          type="checkbox"
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          // checked={weeklyMenuItemForm.vegetarien}
                          onChange={handleWeeklyMenuItemFormChange}
                        />
                        <label
                          htmlFor="edit-weekly-menu-vegetarien"
                          className="ml-2 block text-sm text-gray-900"
                        >
                          Végétarien
                        </label>
                      </div>
                      <div className="mb-4 flex items-center">
                        <input
                          id="edit-weekly-menu-sans-gluten"
                          name="sans_gluten"
                          type="checkbox"
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          checked={weeklyMenuItemForm.sans_gluten}
                          onChange={handleWeeklyMenuItemFormChange}
                        />
                        <label
                          htmlFor="edit-weekly-menu-sans-gluten"
                          className="ml-2 block text-sm text-gray-900"
                        >
                          Sans gluten
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={editWeeklyMenuItem}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Enregistrer
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowEditWeeklyMenuItemModal(false)}
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Weekly Menu Item Modal */}
      {showDeleteWeeklyMenuItemModal && currentWeeklyMenuItem && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <X className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Supprimer le plat
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Êtes-vous sûr de vouloir supprimer le plat "
                        {currentWeeklyMenuItem.nom}" ? Cette action ne peut pas
                        être annulée.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={deleteWeeklyMenuItem}
                  disabled={isDeletingWeeklyMenuItem}
                >
                  {isDeletingWeeklyMenuItem ? (
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Trash className="h-4 w-4 mr-2" />
                  )}
                  Supprimer
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowDeleteWeeklyMenuItemModal(false)}
                  disabled={isDeletingWeeklyMenuItem}
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete All Weekly Menu Items Modal */}
      {showDeleteAllWeeklyMenuModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <X className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Supprimer tout le menu de la semaine
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Êtes-vous sûr de vouloir supprimer tous les plats du
                        menu de la semaine ? Cette action ne peut pas être
                        annulée.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={deleteAllWeeklyMenuItems}
                  disabled={isDeletingAllWeeklyMenuItems}
                >
                  {isDeletingAllWeeklyMenuItems ? (
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Trash className="h-4 w-4 mr-2" />
                  )}
                  Supprimer tout
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowDeleteAllWeeklyMenuModal(false)}
                  disabled={isDeletingAllWeeklyMenuItems}
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showConfirmDeleteAllModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <X className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Confirmation de suppression
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Êtes-vous sûr de vouloir supprimer <b>tous</b> les plats du menu de la semaine ? Cette action ne peut pas être annulée.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => { setShowConfirmDeleteAllModal(false); deleteAllWeeklyMenuItems(); }}
                  disabled={isDeletingAllWeeklyMenuItems}
                >
                  {isDeletingAllWeeklyMenuItems ? (
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Trash className="h-4 w-4 mr-2" />
                  )}
                  Supprimer tout
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowConfirmDeleteAllModal(false)}
                  disabled={isDeletingAllWeeklyMenuItems}
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
