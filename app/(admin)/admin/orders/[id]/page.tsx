"use client";

import { useParams, useRouter } from "next/navigation";
import {
  useOrder,
  useUpdateOrderStatus,
  useCreateTrackingEvent,
} from "@/lib/hooks/admin/use-orders";
import { PageLoader } from "@/components/admin/util/loading";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";

const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "payment_verified",
  "preparing",
  "in_transit",
  "delivered",
  "cancelled",
] as const;

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: order, isLoading } = useOrder(params.id);
  const updateStatus = useUpdateOrderStatus(params.id);
  const createTracking = useCreateTrackingEvent(params.id);

  const [trackingLabel, setTrackingLabel] = useState("");
  const [trackingLocation, setTrackingLocation] = useState("");

  if (isLoading) {
    return (
      <div className="p-8">
        <PageLoader label="Loading order..." />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-8 text-center">
        <p className="text-atelier-stone">Order not found</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/admin/orders")}
          className="cursor-pointer"
        >
          ← Back to orders
        </Button>
      </div>
    );
  }

  const handleStatusChange = (status: string) => {
    updateStatus.mutate(
      { status },
      {
        onSuccess: () => toast.success(`Order status updated to ${status}`),
        onError: (err) =>
          toast.error("Failed to update status", { description: err.message }),
      },
    );
  };

  const handleAddTracking = () => {
    if (!trackingLabel) return;
    createTracking.mutate(
      {
        status: order.status,
        label: trackingLabel,
        location: trackingLocation || undefined,
      },
      {
        onSuccess: () => {
          toast.success("Tracking event added");
          setTrackingLabel("");
          setTrackingLocation("");
        },
        onError: (err) =>
          toast.error("Failed to add tracking", { description: err.message }),
      },
    );
  };

  return (
    <div className="p-8 max-w-4xl mx-auto w-full space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/admin/orders")}
          className="cursor-pointer"
        >
          ← Back
        </Button>
        <h2 className="font-heading text-2xl font-medium text-atelier-ink tracking-tight">
          {order.order_number}
        </h2>
      </div>

      {/* Order Info */}
      <div className="bg-white rounded-xl border border-gray-200/60 p-6 space-y-4">
        <h3 className="font-semibold text-atelier-ink">Order Details</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-atelier-stone">Status</p>
            <p className="font-medium capitalize">{order.status}</p>
          </div>
          <div>
            <p className="text-atelier-stone">Total</p>
            <p className="font-medium">${order.total.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-atelier-stone">Subtotal</p>
            <p className="font-medium">${order.subtotal.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-atelier-stone">Shipping</p>
            <p className="font-medium">${order.shipping_cost.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-atelier-stone">Tax</p>
            <p className="font-medium">${order.tax.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-atelier-stone">Date</p>
            <p className="font-medium">
              {new Date(order.created_at).toLocaleString()}
            </p>
          </div>
          {order.tracking_id && (
            <div>
              <p className="text-atelier-stone">Tracking ID</p>
              <p className="font-medium">{order.tracking_id}</p>
            </div>
          )}
          {order.courier && (
            <div>
              <p className="text-atelier-stone">Courier</p>
              <p className="font-medium">{order.courier}</p>
            </div>
          )}
        </div>

        {order.shipping_address && (
          <div className="border-t border-gray-100 pt-4">
            <p className="text-atelier-stone text-sm mb-2">Shipping Address</p>
            <p className="text-sm">
              {order.shipping_address.full_name}
              <br />
              {order.shipping_address.address_line_1}
              <br />
              {order.shipping_address.address_line_2 && (
                <>
                  {order.shipping_address.address_line_2}
                  <br />
                </>
              )}
              {order.shipping_address.city}, {order.shipping_address.state}{" "}
              {order.shipping_address.postal_code}
              <br />
              {order.shipping_address.country}
              {order.shipping_address.phone && (
                <>
                  <br />
                  {order.shipping_address.phone}
                </>
              )}
            </p>
          </div>
        )}
      </div>

      {/* Status Update */}
      <div className="bg-white rounded-xl border border-gray-200/60 p-6 space-y-4">
        <h3 className="font-semibold text-atelier-ink">Update Status</h3>
        <div className="flex flex-wrap gap-2">
          {ORDER_STATUSES.map((status) => (
            <Button
              key={status}
              variant={order.status === status ? "default" : "outline"}
              size="sm"
              disabled={updateStatus.isPending}
              onClick={() => handleStatusChange(status)}
              className="capitalize cursor-pointer"
            >
              {status.replace(/_/g, " ")}
            </Button>
          ))}
        </div>
      </div>

      {/* Tracking Events */}
      <div className="bg-white rounded-xl border border-gray-200/60 p-6 space-y-4">
        <h3 className="font-semibold text-atelier-ink">Add Tracking Event</h3>
        <div className="flex gap-3">
          <input
            value={trackingLabel}
            onChange={(e) => setTrackingLabel(e.target.value)}
            placeholder="Label (e.g. Package picked up)"
            className="flex-1 px-3 py-2 bg-atelier-bg border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-atelier-accent/30 focus:border-atelier-accent outline-none transition-all cursor-text"
          />
          <input
            value={trackingLocation}
            onChange={(e) => setTrackingLocation(e.target.value)}
            placeholder="Location (optional)"
            className="flex-1 px-3 py-2 bg-atelier-bg border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-atelier-accent/30 focus:border-atelier-accent outline-none transition-all cursor-text"
          />
          <Button
            size="sm"
            onClick={handleAddTracking}
            disabled={createTracking.isPending || !trackingLabel}
            className="cursor-pointer bg-black text-white hover:bg-black/90"
          >
            {createTracking.isPending ? "Adding..." : "+ Add"}
          </Button>
        </div>
      </div>
    </div>
  );
}
