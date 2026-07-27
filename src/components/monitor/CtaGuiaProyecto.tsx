"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { LightButton } from "@/components/SectionRow";
import { COUNTRIES } from "@/lib/countries";
import { CONTACT_HREF, GUIA_BODY, GUIA_HEADING, GUIA_IMAGE, GUIA_SECTORES } from "@/lib/monitor";

/**
 * S3 · #applications — banner-guía "Diseña tu proyecto de calidad del aire"
 * (`et_pb_cta_0`) + el popup de descarga que abre su CTA
 * (`#disenar-proyecto-form-esp`, plugin Popups for Divi).
 *
 * El formulario del original es de ActiveCampaign (`_form_106_`) con reCAPTCHA:
 * aquí se replica **solo visualmente** (mismos campos, etiquetas y orden) y el
 * envío lleva a contacto — sin backend, sin reCAPTCHA, sin terceros.
 *
 * La caja del popup es la sección azul #0075C9 con radius 15, pero su fila
 * interior es blanca a ancho completo con 35px de padding: en pantalla se ve
 * una tarjeta blanca (el azul queda tapado, igual que en el original).
 *
 * Spec: docs/research/monitor-calidad-aire/components/reutilizables.spec.md §2c–2d
 */
export function CtaGuiaProyecto() {
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    closeRef.current?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close]);

  return (
    <>
      {/* ---------- Banner promo (dentro de la columna 3/4) ---------- */}
      <div
        className="mb-[35px] bg-cover bg-center px-[60px] py-[40px] text-center"
        style={{
          backgroundImage: `url('${GUIA_IMAGE}')`,
          backgroundColor: "rgba(0, 0, 0, 0.33)",
          backgroundBlendMode: "multiply",
        }}
      >
        <div className="pb-[20px]">
          <h4
            className="pb-[10px]"
            style={{
              fontSize: 37,
              lineHeight: "37px",
              fontWeight: 600,
              letterSpacing: "-0.5px",
              color: "#fff",
            }}
          >
            {GUIA_HEADING}
          </h4>
          <p className="text-[18px] leading-[30.6px] text-white">{GUIA_BODY}</p>
        </div>

        <LightButton onClick={() => setOpen(true)}>Descargar ahora</LightButton>
      </div>

      {/* ---------- Popup ---------- */}
      {open ? <GuiaPopup onClose={close} closeRef={closeRef} /> : null}
    </>
  );
}

function GuiaPopup({
  onClose,
  closeRef,
}: {
  onClose: () => void;
  closeRef: React.RefObject<HTMLButtonElement | null>;
}) {
  return (
    <>
      {/* Overlay del plugin: negro al 55%, cierra al hacer clic fuera */}
      <div
        className="fixed inset-0 z-[1000001] bg-black/55"
        onClick={onClose}
        aria-hidden
      />

      <div
        className="fixed inset-0 z-[1000002] flex items-start justify-center overflow-y-auto p-[10px]"
        onClick={onClose}
      >
        {/* Caja: sección azul con radius 15; la fila interior blanca la cubre */}
        <div
          role="dialog"
          aria-modal="true"
          aria-label={GUIA_HEADING}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-[400px] overflow-hidden rounded-[15px] bg-[#0075C9]"
        >
          {/* `.da-close` del plugin: 30×30 arriba a la derecha, "×" 32px #eee */}
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="absolute right-0 top-0 z-[1] flex h-[30px] w-[30px] items-center justify-center text-[32px] leading-none text-[#eee] transition-colors hover:text-[#999]"
          >
            ×
          </button>

          <div className="rounded-[15px] bg-white p-[35px]">
            {/* Intro (et_pb_text_36) */}
            <div className="pb-[10px] text-[16px] leading-[1.5em] text-[#333]">
              <p>Para descargar la guía, rellena el siguiente formulario.</p>
              <p>Te enviaremos un email con el enlace al documento.</p>
            </div>

            <GuiaForm />
          </div>
        </div>
      </div>
    </>
  );
}

/* Tipografía del form original (ActiveCampaign): Roboto con caída a Arial. */
const FORM_FONT = 'Roboto, arial, helvetica, sans-serif';
const FIELD_CLASS =
  "block w-full rounded-[4px] border border-[#979797] bg-[#f3f3f3] p-[6px] text-[14px] text-black";
const LABEL_CLASS = "mb-[5px] block text-[14px] font-bold text-[#5e666f]";

function GuiaForm() {
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Sin backend: el original postea a ActiveCampaign; aquí a contacto.
    window.location.href = CONTACT_HREF;
  };

  return (
    <form onSubmit={onSubmit} style={{ fontFamily: FORM_FONT }} className="space-y-[15px]">
      <div>
        <label htmlFor="guia-fullname" className={LABEL_CLASS}>
          Nombre y Apellidos*
        </label>
        <input id="guia-fullname" name="fullname" type="text" required className={FIELD_CLASS} />
      </div>

      <div>
        <label htmlFor="guia-email" className={LABEL_CLASS}>
          Email de trabajo*
        </label>
        <input id="guia-email" name="email" type="text" required className={FIELD_CLASS} />
      </div>

      <div>
        <label htmlFor="guia-empresa" className={LABEL_CLASS}>
          Empresa*
        </label>
        <input id="guia-empresa" name="empresa" type="text" required className={FIELD_CLASS} />
      </div>

      <div>
        <label htmlFor="guia-pais" className={LABEL_CLASS}>
          País*
        </label>
        <select id="guia-pais" name="pais" required defaultValue="" className={FIELD_CLASS}>
          <option value="" />
          {COUNTRIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="guia-sector" className={LABEL_CLASS}>
          Sector*
        </label>
        <select id="guia-sector" name="sector" required defaultValue="" className={FIELD_CLASS}>
          <option value="" />
          {GUIA_SECTORES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <fieldset>
        <legend className={LABEL_CLASS}>Política de Privacidad y Suscripción</legend>
        {["Acepto los términos y condiciones", "Acepto recibir correos con contenido de Kunak"].map(
          (label) => (
            <div key={label} className="flex items-baseline">
              <input
                id={`guia-${label}`}
                type="checkbox"
                name="privacidad"
                value={label}
                className="me-[0.3em] h-[1.3em] w-[1.3em] shrink-0 align-middle"
              />
              <label htmlFor={`guia-${label}`} className="text-[14px] text-[#5e666f]">
                {label}
              </label>
            </div>
          ),
        )}
      </fieldset>

      <button
        type="submit"
        className="cursor-pointer rounded-[6px] bg-[#0075C9] p-[14px] text-[14px] text-white"
      >
        DESCARGAR
      </button>
    </form>
  );
}
