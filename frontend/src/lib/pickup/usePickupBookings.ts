import { useLocalRecords } from "@/lib/useLocalList";
import { PICKUP_BOOKINGS_KEY } from "./config";
import type { PickupBooking } from "./types";

export function usePickupBookings() {
  const { items, upsert, remove } = useLocalRecords<PickupBooking>(PICKUP_BOOKINGS_KEY);

  const addBooking = (booking: PickupBooking) => upsert(booking);

  const getUserBookings = (userId: string) =>
    items
      .filter((b) => b.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const getBooking = (id: string) => items.find((b) => b.id === id);

  const updateStatus = (id: string, status: PickupBooking["status"], extra?: Partial<PickupBooking>) => {
    const existing = items.find((b) => b.id === id);
    if (!existing) return;
    upsert({ ...existing, ...extra, status });
  };

  return { bookings: items, addBooking, getUserBookings, getBooking, updateStatus, remove };
}
