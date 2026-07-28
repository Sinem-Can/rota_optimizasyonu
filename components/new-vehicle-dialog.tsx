'use client'

import { ChevronDown, Plus, Truck } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { fleetFeatureList, fleetVehicles, type FleetStatus } from '@/lib/route-data'

const fieldClass =
  'h-9 w-full rounded-md border border-input bg-background px-3 text-[13px] text-foreground outline-none transition placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20'

const selectClass =
  'h-9 w-full appearance-none rounded-md border border-input bg-background pl-3 pr-8 text-[13px] font-medium text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20'

const labelClass = 'text-[11px] font-semibold uppercase tracking-wide text-muted-foreground'

const vehicleTypes = ['Panelvan', 'Kamyonet', 'Kamyon', 'Tır', 'Motokurye'] as const

/** Depo listesi mevcut filo verisinden türetilir, böylece tek kaynak korunur. */
const depots = Array.from(new Set(fleetVehicles.map((v) => v.depot)))

const statuses: FleetStatus[] = ['Aktif', 'İzinde', 'Arızalı']

function SelectField({
  id,
  name,
  label,
  options,
}: {
  id: string
  name: string
  label: string
  options: readonly string[]
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} className={labelClass}>
        {label}
      </Label>
      <div className="relative">
        <select id={id} name={name} defaultValue={options[0]} className={selectClass}>
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
      </div>
    </div>
  )
}

function TextField({
  id,
  name,
  label,
  placeholder,
  required,
  type = 'text',
  mono,
  suffix,
}: {
  id: string
  name: string
  label: string
  placeholder?: string
  required?: boolean
  type?: string
  mono?: boolean
  suffix?: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} className={labelClass}>
        {label}
      </Label>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={type}
          required={required}
          placeholder={placeholder}
          className={`${mono ? `${fieldClass} font-mono` : fieldClass} ${suffix ? 'pr-10' : ''}`}
        />
        {suffix ? (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-medium text-muted-foreground">
            {suffix}
          </span>
        ) : null}
      </div>
    </div>
  )
}

export function NewVehicleDialog({
  triggerLabel = 'Yeni Araç',
  triggerClassName,
}: {
  /** Aksiyon çubuğunda kısa etiket ("Yeni") kullanmak için. */
  triggerLabel?: string
  triggerClassName?: string
} = {}) {
  const [open, setOpen] = useState(false)
  const formId = 'new-vehicle-form'

  // Demo formu: filo servisine bağlanana kadar yalnızca modalı kapatır.
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setOpen(false)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          triggerClassName ??
          'ml-auto flex h-9 shrink-0 items-center gap-2 rounded-md bg-primary px-3.5 text-[13px] font-semibold text-primary-foreground transition-opacity hover:opacity-90'
        }
      >
        <Plus className="size-4" />
        {triggerLabel}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <div className="flex items-center gap-2.5">
              <div className="grid size-8 shrink-0 place-items-center rounded-md bg-accent text-accent-foreground">
                <Truck className="size-4" />
              </div>
              <div>
                <DialogTitle className="text-[15px] font-semibold tracking-tight">
                  Yeni Araç Ekle
                </DialogTitle>
                <DialogDescription className="text-[12px]">
                  Araç, sürücü ve kapasite bilgilerini girerek filoya yeni kayıt ekleyin.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form id={formId} onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <TextField
                id="vehicle-plate"
                name="plate"
                label="Araç Plakası"
                placeholder="34 ABC 123"
                required
                mono
              />
              <SelectField
                id="vehicle-type"
                name="vehicleType"
                label="Araç Tipi"
                options={vehicleTypes}
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <TextField
                id="vehicle-driver"
                name="driverName"
                label="Sürücü Adı"
                placeholder="Örn. Mehmet Yılmaz"
                required
              />
              <SelectField
                id="vehicle-depot"
                name="depot"
                label="Bağlı Olduğu Depo"
                options={depots}
              />
            </div>

            {/* Özellikler (donanım) */}
            <fieldset className="flex flex-col gap-2">
              <legend className={labelClass}>Özellikler</legend>
              <div className="grid gap-2 rounded-md border border-input bg-secondary/30 p-3 sm:grid-cols-2">
                {fleetFeatureList.map((feature) => (
                  <label
                    key={feature}
                    className="flex cursor-pointer items-center gap-2 text-[13px] font-medium text-foreground"
                  >
                    <Checkbox name="features" value={feature} />
                    {feature}
                  </label>
                ))}
              </div>
            </fieldset>

            {/* Maksimum kapasite */}
            <div className="flex flex-col gap-2">
              <span className={labelClass}>Maksimum Kapasite</span>
              <div className="grid gap-3 sm:grid-cols-2">
                <TextField
                  id="vehicle-capacity-kg"
                  name="capacityMaxKg"
                  label="Ağırlık"
                  type="number"
                  placeholder="1500"
                  suffix="kg"
                  mono
                />
                <TextField
                  id="vehicle-capacity-m3"
                  name="capacityMaxM3"
                  label="Hacim"
                  type="number"
                  placeholder="12"
                  suffix="m³"
                  mono
                />
              </div>
            </div>

            <SelectField id="vehicle-status" name="status" label="Durum" options={statuses} />
          </form>

          <DialogFooter>
            <DialogClose render={<Button variant="ghost" size="sm" />}>İptal</DialogClose>
            <Button type="submit" form={formId} size="sm">
              Kaydet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
