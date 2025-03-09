import { UTApi } from "uploadthing/server";

export const utapi = new UTApi();

class FileRepository {
  /**
   * ลบไฟล์จาก UploadThing
   * @param fileUrl URL ของไฟล์ที่ต้องการลบ
   * @returns Message ว่าลบสำเร็จหรือไม่
   */
  async deleteFile(fileUrl: string): Promise<string> {
    if (!fileUrl) {
      throw new Error("File URL is required");
    }

    try {
      // ลบไฟล์โดยใช้ UploadThing
      await utapi.deleteFiles([fileUrl]); // เปลี่ยนเป็น UTApi
      return "File deleted successfully";
    } catch (error) {
      console.error("Failed to delete file:", error);
      throw new Error("Failed to delete file");
    }
  }
}

export const fileRepository = new FileRepository();
