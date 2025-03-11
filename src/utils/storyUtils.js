export function formatDate(dateString) {
    if (!dateString) 
        return "Invalid date";
    const [year, month, day] = dateString.split("-");
    return `${day}. ${month}. ${year}`;
}