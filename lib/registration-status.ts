import type { RegistrationStatus } from "@prisma/client";

export function getRegistrationStatusLabel(
  status: RegistrationStatus
) {
  switch (status) {
    case "PENDING":
      return "Pending Approval";
    case "WAITLISTED":
      return "Waitlisted";
    case "APPROVED":
      return "Approved";
    case "REJECTED":
      return "Rejected";
    case "CANCELLED":
      return "Cancelled";
  }
}

export function getRegistrationStatusClassName(
  status: RegistrationStatus
) {
  switch (status) {
    case "PENDING":
      return "bg-blue-100 text-blue-700";
    case "WAITLISTED":
      return "bg-yellow-100 text-yellow-700";
    case "APPROVED":
      return "bg-green-100 text-green-700";
    case "REJECTED":
      return "bg-red-100 text-red-700";
    case "CANCELLED":
      return "bg-gray-100 text-gray-700";
  }
}
