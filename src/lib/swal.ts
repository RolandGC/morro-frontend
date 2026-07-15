import Swal from "sweetalert2";

export const confirmAction = (
    title: string,
    text: string,
    confirmText: string
) =>
    Swal.fire({
        title,
        text,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: confirmText,
        cancelButtonText: "Cancelar",
        reverseButtons: true,
        buttonsStyling: false,
        customClass: {
            confirmButton:
                "bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg ml-2",
            cancelButton:
                "bg-gray-500 hover:bg-gray-600 text-white font-medium px-4 py-2 rounded-lg mr-2",
        },
    });