"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { cn } from "@/libs";
import { useTranslation } from "react-i18next";
import * as Dialog from "@radix-ui/react-dialog";
import "leaflet/dist/leaflet.css";
import { Button, Input, Label } from "../ui";
import axios from "axios";
import { toUpperCase } from "@/utils";
import { LocationPickerProps, PickedLocation } from "@/types";

const createSvgIcon = (color = "#0ea5a4") =>
  L.divIcon({
    className: "custom-svg-marker",
    html: `<svg width="28" height="40" viewBox="0 0 28 40" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs><filter id="s" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.15"/></filter></defs>
      <path d="M14 0C8.48 0 4 4.98 4 10.5 4 18.5 14 36 14 36s10-17.5 10-25.5C24 4.98 19.52 0 14 0z" fill="${color}" filter="url(#s)"/>
      <circle cx="14" cy="10.5" r="4.5" fill="#fff"/>
    </svg>`,
    iconSize: [28, 40],
    iconAnchor: [14, 40]
  });

const DEFAULT_CENTER = { lat: 41.715136, lng: 44.827096 }; // Tbilisi

function MapClickHandler({
  onClick
}: {
  onClick: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e: any) {
      if (!e?.latlng) return;
      onClick(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
}

export function LocationPicker({
  id,
  className,
  label,
  value,
  placeholder,
  disabled = false,
  required = false,
  onChange,
  onChangeFull,
  onValidate,
  defaultCenter = DEFAULT_CENTER,
  mapHeight = "h-[400px]"
}: LocationPickerProps) {
  const { t } = useTranslation();

  const [address, setAddress] = useState<string>(() => value ?? "");
  const [marker, setMarker] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [center, setCenter] = useState<{ lat: number; lng: number }>(
    defaultCenter
  );
  const [error, setError] = useState<string | undefined>(undefined);

  const [open, setOpen] = useState(false);
  const [tempMarker, setTempMarker] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [tempAddress, setTempAddress] = useState<string>("");
  const [transEn, setTransEn] = useState<string>("");
  const [transKa, setTransKa] = useState<string>("");

  const svgIcon = useMemo(() => createSvgIcon("#0ea5a4"), []);

  useEffect(() => {
    setAddress(value ?? "");
  }, [value]);

  const reverseGeocode = useCallback(
    async (lat: number, lng: number) => {
      setError(undefined);
      try {
        const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}&addressdetails=1`;
        const res = await axios.get(url);
        const data = res.data;
        const cc = (data?.address?.country_code || "").toLowerCase();
        if (cc !== "ge") {
          const msg =
            toUpperCase(t("forms.errors.mustBeInGeorgia")) ??
            "Please pick a location inside Georgia.";
          setError(msg);
          onValidate?.(msg);
          return null;
        }
        const fmt = data.display_name || `${lat},${lng}`;
        onValidate?.(undefined);
        return { address: fmt, placeId: String(data.place_id ?? "") };
      } catch {
        const msg =
          toUpperCase(t("forms.errors.cantResolveAddress")) ??
          "Can't resolve address for selected location.";
        setError(msg);
        onValidate?.(msg);
        return null;
      } finally {
        // ignore
      }
    },
    [onValidate, t]
  );

  const openPicker = useCallback(() => {
    setTempMarker(marker ?? center);
    setTempAddress(address ?? "");
    setTransEn("");
    setTransKa("");
    setOpen(true);
    setError(undefined);
  }, [marker, center, address]);

  const handleConfirm = useCallback(async () => {
    if (!tempMarker) {
      const msg =
        toUpperCase(t("forms.errors.invalidPlace")) ??
        "Pick a place on the map.";
      setError(msg);
      onValidate?.(msg);
      return;
    }
    const rev = await reverseGeocode(tempMarker.lat, tempMarker.lng);
    if (!rev) return;
    const picked: PickedLocation = {
      address: rev.address,
      lat: tempMarker.lat,
      lng: tempMarker.lng,
      placeId: rev.placeId,
      translations: { en: transEn || undefined, ka: transKa || undefined }
    };
    setMarker({ lat: picked.lat, lng: picked.lng });
    setCenter({ lat: picked.lat, lng: picked.lng });
    setAddress(picked.address);
    setOpen(false);
    setError(undefined);
    onValidate?.(undefined);

    onChange?.(picked.address);
    onChangeFull?.(picked);
  }, [
    tempMarker,
    reverseGeocode,
    transEn,
    transKa,
    onChange,
    onChangeFull,
    onValidate,
    t
  ]);

  const handleCancel = useCallback(() => {
    setTempMarker(marker ?? null);
    setTempAddress(address ?? "");
    setOpen(false);
    setError(undefined);
  }, [marker, address]);

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label
          htmlFor={id}
          className="text-foreground block !text-sm font-medium"
        >
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      <div>
        <div className="flex gap-3">
          <Input
            id={id}
            readOnly
            value={address}
            onClick={() => {
              if (!disabled) openPicker();
            }}
            placeholder={
              placeholder ??
              (toUpperCase(t("contact.form.locationPlaceholder")) as string) ??
              "e.g., Tbilisi, Georgia"
            }
            className={cn(
              "!h-10 w-full cursor-pointer rounded-md border px-3 py-2 text-sm",
              error ? "border-destructive" : "border-border",
              disabled ? "pointer-events-none opacity-50" : ""
            )}
            disabled={disabled}
          />
          <Button
            type="button"
            disabled={disabled}
            onClick={() => {
              setAddress("");
              setMarker(null);
              onChange?.("");
              onChangeFull?.(null);
              onValidate?.(undefined);
            }}
          >
            {toUpperCase(t("forms.clear"))}
          </Button>
        </div>
        {error && <div className="text-destructive mt-2 text-sm">{error}</div>}
      </div>

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-[min(1000px,96%)] max-w-[1000px] -translate-x-1/2 -translate-y-1/2 rounded bg-white p-4 shadow-lg">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <Dialog.Title className="text-lg font-medium">
                  {toUpperCase(t("contact.form.selectLocation"))}
                </Dialog.Title>
                <div className="text-muted-foreground text-xs">
                  {tempAddress ?? ""}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button onClick={handleCancel} variant="secondary">
                  {toUpperCase(t("forms.cancel"))}
                </Button>
                <Button onClick={handleConfirm}>
                  {toUpperCase(t("forms.save"))}
                </Button>
              </div>
            </div>

            <div
              className={cn(
                "border-border overflow-hidden rounded-md border",
                mapHeight
              )}
            >
              <MapContainer
                center={[center.lat, center.lng] as [number, number]}
                zoom={13}
                style={{ width: "100%", height: "100%" }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <MapClickHandler
                  onClick={async (lat, lng) => {
                    setTempMarker({ lat, lng });
                    const rev = await reverseGeocode(lat, lng);
                    if (rev) setTempAddress(rev.address);
                  }}
                />
                {tempMarker && (
                  <Marker
                    position={
                      [tempMarker.lat, tempMarker.lng] as [number, number]
                    }
                    icon={svgIcon}
                    draggable
                    eventHandlers={{
                      dragend: async (e: any) => {
                        const tLat = e.target.getLatLng().lat;
                        const tLng = e.target.getLatLng().lng;
                        setTempMarker({ lat: tLat, lng: tLng });
                        const rev = await reverseGeocode(tLat, tLng);
                        if (rev) setTempAddress(rev.address);
                      }
                    }}
                  />
                )}
              </MapContainer>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
