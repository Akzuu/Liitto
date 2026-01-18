/**
 * Generate a unique invitation code in the format: XXXX-XXXX
 * Uses uppercase letters and numbers (excluding similar characters: 0, O, 1, I)
 */
export const generateInvitationCode = (): string => {
  // Characters that are easy to distinguish when written/typed
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";

  for (let i = 0; i < 8; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    code += chars[randomIndex];

    // Add hyphen after 4th character
    if (i === 3) {
      code += "-";
    }
  }

  return code;
};
