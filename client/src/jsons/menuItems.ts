export type MenuItemsType = {
  title: string;
  url: string;
  icon: string;
};

export const menuItems: MenuItemsType[] = [
  {
    title: "لندینگ",
    url: "/",
    icon: "ki-home",
  },
  {
    title: "خانه",
    url: "/home",
    icon: "ki-category",
  },
  {
    title: "صوت‌ها",
    url: "/audio/1",
    icon: "ki-abstract-45",
  },
  {
    title: "کاربر",
    url: "/dashboard",
    icon: "ki-user",
  },
];
