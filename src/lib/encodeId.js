export const decodeId = (encodedId) => {
    try {
        return Buffer.from(encodedId, 'base64').toString('utf-8');
    } catch {
        return encodedId; // fallback ถ้า decode ไม่ได้
    }
};
