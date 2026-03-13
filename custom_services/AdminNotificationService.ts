export const simulateAdminNotification = async (medName: string, category: string, instructions: string) => {
    // In a real backend, this would POST to /api/request-medication
    console.log(`[ADMIN NOTIFICATION] User requested new medication: ${medName} (${category})`);
    console.log(`[Details] Instructions: ${instructions}`);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return true;
};
