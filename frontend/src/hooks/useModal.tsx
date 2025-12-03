import { useState } from "react";

export type ModalType = "login" | "register" | "task" | null;

export default function useModalManager() {
    const [modal, setModal] = useState<ModalType>(null);

    const open = (type: ModalType) => setModal(type);
    const close = () => setModal(null);

    return { modal, open, close, isOpen: modal !== null };
}