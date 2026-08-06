'use client'

import { useEffect, useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Mail,
  MapPinned,
  PanelLeft,
  PlayCircle,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

const onboardingSteps = [
  {
    title: 'Haritadan başlayın',
    description:
      'Planlama ekranının merkezinde harita yer alır. Rotaları, durakları ve araç dağılımını buradan tek bakışta takip edin.',
    icon: MapPinned,
  },
  {
    title: 'Sol paneli yönetin',
    description:
      'Sol panelden atanmamış siparişleri inceleyin ve “Rotaları Optimize Et” ile araçlara otomatik dağıtın. Sağ üstteki ikonla paneli daraltıp haritaya daha fazla alan açabilirsiniz.',
    icon: PanelLeft,
  },
  {
    title: 'Zaman çizelgesini açın',
    description:
      'Alt çubuktaki ok ile Zaman Çizelgesi’ni açıp vardiya ve teslimat saatlerini inceleyin. İşiniz bittiğinde aynı ikonla tekrar kapatabilirsiniz.',
    icon: Clock,
  },
  {
    title: 'Bir durağı seçin',
    description:
      'Haritadaki bir pine veya çizelgedeki durağa tıkladığınızda sağ panel durak detayına dönüşür. Adres, cari kod ve teslim edilen saat gibi bilgileri burada görürsünüz.',
    icon: MapPinned,
  },
  {
    title: 'Hızlı aksiyonla bilgilendirin',
    description:
      'Durak detayındaki Hızlı İşlemler alanından sürücüye e-posta gönderebilir; gerekirse kalem ikonuyla zaman ve kapasite bilgilerini düzenleyebilirsiniz.',
    icon: Mail,
  },
] as const

export function OnboardingModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeStep, setActiveStep] = useState(0)
  const step = onboardingSteps[activeStep]
  const StepIcon = step.icon
  const isLastStep = activeStep === onboardingSteps.length - 1

  useEffect(() => {
    const timer = window.setTimeout(() => setIsOpen(true), 500)
    return () => window.clearTimeout(timer)
  }, [])

  const closeTour = () => {
    setIsOpen(false)
    setActiveStep(0)
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) closeTour()
        else setIsOpen(true)
      }}
    >
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            Planlama Ekranına Hoş Geldiniz
          </DialogTitle>
          <DialogDescription className="pt-2 text-center text-muted-foreground">
            Güncel operasyon ekranını kısaca tanıyın.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="mb-5 flex justify-center gap-1.5" aria-label="Tur ilerlemesi">
            {onboardingSteps.map((item, index) => (
              <span
                key={item.title}
                className={
                  index === activeStep
                    ? 'h-1.5 w-6 rounded-full bg-primary transition-all'
                    : 'size-1.5 rounded-full bg-muted transition-all'
                }
              />
            ))}
          </div>

          <div className="flex min-h-40 flex-col items-center justify-center rounded-xl border border-border bg-secondary/40 p-5 text-center">
            <div className="mb-3 grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
              <StepIcon className="size-6" />
            </div>
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Adım {activeStep + 1} / {onboardingSteps.length}
            </p>
            <h3 className="mt-1 text-lg font-bold text-foreground">{step.title}</h3>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
              {step.description}
            </p>
          </div>
        </div>

        <DialogFooter className="flex-row justify-between gap-2 sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setActiveStep((index) => Math.max(0, index - 1))}
            disabled={activeStep === 0}
          >
            <ChevronLeft className="size-4" />
            Geri
          </Button>
          {isLastStep ? (
            <Button type="button" onClick={closeTour}>
              <PlayCircle className="size-4" />
              Planlamaya Başla
            </Button>
          ) : (
            <Button type="button" onClick={() => setActiveStep((index) => index + 1)}>
              Devam
              <ChevronRight className="size-4" />
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
