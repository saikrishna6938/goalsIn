import { api } from "../api/API";

export const getNavigations = async (userType) => {
  let navigations = await [
    { name: "Dashboard", path: "/dashboard/default", icon: "dashboard" },
    {
      name: "Apply",
      icon: "F",
      children: await getUserDocuments(userType),
    },
  ];
  return navigations;
};

async function getUserDocuments(userType) {
  try {
    const res = await api.get(
      `document-type/get-documentstypes-usertype/${userType}`
    );
    return res.data.map((d) => ({
      name: d.documentTypeName,
      iconText: "F",
      path: `/user/document/${d.documentTypeId}`,
    }));
  } catch (error) {
    // Handle any potential errors from the API call
    console.error("Error fetching user documents:", error);
    return []; //  Return an empty array or handle the error case accordingly
  }
}
