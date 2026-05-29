"use client";

import List from "@/components/Lists/List";
import { ConfirmationModal } from "@/components/modal/ConfirmationModalTemplate";
import { useInstitutionalRecordsContext } from "@/services/institutional-records/context/context";
import { downloadInstitutionalRecordPdf, uploadInstitutionalRecordPdf } from "@/services/institutional-records/service";
import { useModalContext } from "@/services/modal/context/context";
import { InstitutionalRecord } from "@/types/institutionalRecord";
import { formatDateOnly } from "@/utils/functions";
import { useEffect, useState } from "react";

export default function InstitutionalRecordsPage() {
  const { items, isLoading, error, list, paginationData } = useInstitutionalRecordsContext();
  const modal = useModalContext();
  const [title, setTitle] = useState("");
  const [type, setType] = useState("acta");
  const [recordDate, setRecordDate] = useState("");
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
      <th className="w-[20%]">Tipo</th>
      <th className="w-[20%]">Fecha</th>
      <th className="w-[25%]">Documento</th>
    </>
  );

  const toTdComponent = (record: InstitutionalRecord) => (
    <>
      <td>{record.title}</td>
      <td>{record.type}</td>
      <td>{formatDateOnly(record.recordDate, "es-AR")}</td>
      <td className="flex gap-2 items-center">
        {record.fileName ? (
          <button
            className="text-blue-700 hover:underline"
            onClick={async (e) => {
              e.stopPropagation();
              const blob = await downloadInstitutionalRecordPdf(record.id);
              const url = window.URL.createObjectURL(blob);
              const anchor = document.createElement("a");
              anchor.href = url;
              anchor.download = record.fileName ?? `registro_${record.id}.pdf`;
              document.body.appendChild(anchor);
              anchor.click();
              anchor.remove();
              window.URL.revokeObjectURL(url);
            }}
          >
            {record.fileName}
          </button>
        ) : (
          "-"
        )}
        <button
          className="ml-2 text-red-600 hover:underline"
          onClick={(e) => {
            e.stopPropagation();
            modal.setTitle("Eliminar registro institucional");
            modal.changeContent(
              <ConfirmationModal
                text="¿Seguro que deseas eliminar este registro? Esta acción no se puede deshacer."
                onCancel={() => modal.toggleShown()}
                onConfirm={async () => {
                  await import("@/services/institutional-records/service").then(async mod => {
                    await mod.institutionalRecordsService.remove(record.id);
                    await list({ paginationData: { page: 1, itemsPerPage: 10 } });
                  });
                  modal.toggleShown();
                }}
              />
            );
            modal.toggleShown();
          }}
          title="Eliminar registro"
        >
          Eliminar
        </button>
      </td>
    </>
  );

  const handleUpload = async () => {
    if (!title || !type || !recordDate || !file) {
      showMessageModal("Datos incompletos", "Completa titulo, tipo, fecha y archivo PDF");
      return;
    }

    try {
      setIsSubmitting(true);
      await uploadInstitutionalRecordPdf({ title, type, recordDate, file });
      setTitle("");
      setType("acta");
      setRecordDate("");
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
        <h1 className="text-text font-bold text-2xl">REGISTROS INSTITUCIONALES</h1>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2 items-end">
          <input
            className="bg-white rounded px-3 py-2 text-black"
            placeholder="Titulo"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <select className="bg-white rounded px-3 py-2 text-black" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="acta">Acta</option>
            <option value="acuerdo">Acuerdo</option>
            <option value="resolucion">Resolucion</option>
            <option value="asamblea">Asamblea</option>
          </select>
          <input
            type="date"
            className="bg-white rounded px-3 py-2 text-black"
            value={recordDate}
            onChange={(e) => setRecordDate(e.target.value)}
          />
          <input
            type="file"
            accept="application/pdf"
            className="bg-white rounded px-3 py-2 text-black"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
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
