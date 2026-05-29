"use client";

import List from "@/components/Lists/List";
import { ConfirmationModal } from "@/components/modal/ConfirmationModalTemplate";
import { useRegulationsContext } from "@/services/regulations/context/context";
import { downloadRegulationPdf, uploadRegulationPdf } from "@/services/regulations/service";
import { useModalContext } from "@/services/modal/context/context";
import { Regulation } from "@/types/regulation";
import { formatDateOnly } from "@/utils/functions";
import { useEffect, useState } from "react";

export default function RegulationsPage() {
  const { items, isLoading, error, list, paginationData } = useRegulationsContext();
  const modal = useModalContext();
  const [title, setTitle] = useState("");
  const [type, setType] = useState("estatuto");
  const [version, setVersion] = useState("1.0");
  const [effectiveDate, setEffectiveDate] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showMessageModal = (titleText: string, text: string) => {
    modal.setTitle(titleText);
    modal.changeContent(
      <ConfirmationModal
        text={text}
        onCancel={() => modal.toggleShown()}
        onConfirm={() => modal.toggleShown()}
      />,
    );
    modal.toggleShown();
  };

  useEffect(() => {
    list({
      paginationData: { page: 1, itemsPerPage: 10 },
    });
  }, []);

  const onPageChange = async (page: number) => {
    await list({
      paginationData: { page, itemsPerPage: 10 },
    });
  };

  const thComponent = (
    <>
      <th className="w-[35%]">Titulo</th>
      <th className="w-[15%]">Tipo</th>
      <th className="w-[15%]">Version</th>
      <th className="w-[20%]">Vigencia / PDF</th>
      <th className="w-[15%]">Estado</th>
    </>
  );

  const toTdComponent = (regulation: Regulation) => (
    <>
      <td>{regulation.title}</td>
      <td>{regulation.type}</td>
      <td>{regulation.version}</td>
      <td>
        <div className="flex flex-col gap-1">
          <span>{formatDateOnly(regulation.effectiveDate, "es-AR")}</span>
          <div className="flex flex-row gap-2 items-center">
            {regulation.fileName ? (
              <button
                className="text-blue-700 text-left hover:underline"
                onClick={async (e) => {
                  e.stopPropagation();
                  const blob = await downloadRegulationPdf(regulation.id);
                  const url = window.URL.createObjectURL(blob);
                  const anchor = document.createElement("a");
                  anchor.href = url;
                  anchor.download = regulation.fileName ?? `normativa_${regulation.id}.pdf`;
                  document.body.appendChild(anchor);
                  anchor.click();
                  anchor.remove();
                  window.URL.revokeObjectURL(url);
                }}
              >
                {regulation.fileName}
              </button>
            ) : null}
            <button
              className="text-red-600 hover:underline"
              onClick={(e) => {
                e.stopPropagation();
                modal.setTitle("Eliminar normativa");
                modal.changeContent(
                  <ConfirmationModal
                    text="¿Seguro que deseas eliminar esta normativa? Esta acción no se puede deshacer."
                    onCancel={() => modal.toggleShown()}
                    onConfirm={async () => {
                      await import("@/services/regulations/service").then(async mod => {
                        await mod.regulationsService.remove(regulation.id);
                        await list({ paginationData: { page: 1, itemsPerPage: 10 } });
                      });
                      modal.toggleShown();
                    }}
                  />
                );
                modal.toggleShown();
              }}
              title="Eliminar normativa"
            >
              Eliminar
            </button>
          </div>
        </div>
      </td>
      <td>{regulation.isActive ? "Activa" : "Inactiva"}</td>
    </>
  );

  const handleUpload = async () => {
    if (!title || !type || !version || !file) {
      showMessageModal("Datos incompletos", "Completa titulo, tipo, version y archivo PDF");
      return;
    }

    try {
      setIsSubmitting(true);
      await uploadRegulationPdf({ title, type, version, effectiveDate: effectiveDate || undefined, file });
      setTitle("");
      setType("estatuto");
      setVersion("1.0");
      setEffectiveDate("");
      setFile(null);
      await list({ paginationData: { page: 1, itemsPerPage: 10 } });
    } catch (uploadError) {
      showMessageModal("Error", `No se pudo subir el PDF: ${String(uploadError)}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-full p-5">
        <div className="w-full h-full bg-background-dark rounded-md p-8 flex items-center justify-center">Cargando...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full p-5">
        <div className="w-full h-full bg-background-dark rounded-md p-8 flex items-center justify-center text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full p-5">
      <div className="w-full h-full bg-background-dark rounded-md p-8 flex flex-col gap-4">
        <h1 className="text-text font-bold text-2xl">ADMINISTRACION NORMATIVA</h1>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-2 items-end">
          <input className="bg-white rounded px-3 py-2 text-black" placeholder="Titulo" value={title} onChange={(e) => setTitle(e.target.value)} />
          <select className="bg-white rounded px-3 py-2 text-black" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="estatuto">Estatuto</option>
            <option value="reglamento">Reglamento</option>
            <option value="politica">Politica</option>
            <option value="norma">Norma</option>
          </select>
          <input className="bg-white rounded px-3 py-2 text-black" placeholder="Version" value={version} onChange={(e) => setVersion(e.target.value)} />
          <input type="date" className="bg-white rounded px-3 py-2 text-black" value={effectiveDate} onChange={(e) => setEffectiveDate(e.target.value)} />
          <input type="file" accept="application/pdf" className="bg-white rounded px-3 py-2 text-black" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          <button className="bg-blue-600 text-white rounded px-3 py-2 hover:bg-blue-700" onClick={handleUpload} disabled={isSubmitting}>
            {isSubmitting ? "Subiendo..." : "Subir PDF"}
          </button>
        </div>
        <div className="flex-1 overflow-auto pb-5">
          <List
            list={items}
            thComponent={thComponent}
            toTdComponent={toTdComponent}
            paginationData={paginationData ?? undefined}
            onPageChange={onPageChange}
          />
        </div>
      </div>
    </div>
  );
}
