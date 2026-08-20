type UserRole =
  | "ADMIN"
  | "TEACHER"
  | "PARENT"
  | "STUDENT"
  | "ADULT";

export function getDashboardHref(
  role: string
) {
  switch (role as UserRole) {
    case "ADMIN":
      return "/dashboard/admin";

    case "TEACHER":
      return "/dashboard/teacher";

    case "PARENT":
      return "/dashboard/parent";

    case "ADULT":
      return "/dashboard/adult";

    case "STUDENT":
      return "/dashboard/students";

    default:
      return "/dashboard";
  }
}

export function getPortalLabel(
  role: string
) {
  switch (role as UserRole) {
    case "ADMIN":
      return "Admin Portal";

    case "TEACHER":
      return "Teacher Portal";

    case "PARENT":
      return "Parent Portal";

    case "ADULT":
    case "STUDENT":
      return "Student Portal";

    default:
      return "Portal";
  }
}
