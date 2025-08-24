import React, { useState } from "react";
import { PlusOutlined } from "@ant-design/icons";
import { Image, Upload, message } from "antd";
import type { FormInstance, UploadFile, UploadProps } from "antd";
import { Form } from "antd";
import { File } from "@/types";
import { ADMIN_API_PATH, getFileUrl } from "@/utils";

type MultiFileUploadProps = {
  form: FormInstance;
  onChange?: (value: { name: string; path: string; size: number }[]) => void;
  name: string | string[];
  required?: boolean;
  label?: string;
  withIndex?: boolean;
  index?: number;
  images?: File[];
  multiImages?: File[];
  loading: boolean;
  imageLimit?: number;
  setLoading: (loading: boolean) => void;
  setUploadedImages?: (images: File[] | any) => void;
};

interface UploadFileType extends UploadFile {
  path?: string;
}

export const MultiFileUpload: React.FC<MultiFileUploadProps> = ({
  form,
  name,
  required,
  images,
  index,
  multiImages,
  withIndex = false,
  imageLimit = 100,
  label,
  setUploadedImages,
  setLoading
}) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [fileList, setFileList] = useState<UploadFileType[]>([]);

  const handlePreview = async (file: UploadFileType) => {
    setPreviewImage(file?.response?.file?.path || file?.path);
    setPreviewOpen(true);
  };

  const handleChange: UploadProps["onChange"] = ({ fileList: newFileList }) => {
    try {
      if (newFileList.length > imageLimit) {
        message.warning(`You can only upload up to ${imageLimit} images.`);
        return;
      }

      setFileList(newFileList);
      setLoading(true);

      const formattedFiles = newFileList
        .filter((file) => file.status === "done")
        .map((file: UploadFileType, index) => {
          if (file.response && file.response.file.path) {
            return {
              index,
              name: file.name || file.response.file.originalname,
              path: file.response.file.path,
              size: file.size || file.response.file.size,
              status: "done",
              url: file.response.file.path
            };
          }
          return file.url
            ? {
                index,
                name: file.name,
                path: file.path,
                size: file.size,
                status: "done"
              }
            : null;
        })
        .filter(Boolean) as File[];

      if (Array.isArray(name) && name.length === 3) {
        const [listName, lang, fieldName] = name;
        const currentLangValue = form?.getFieldValue([listName, lang]);
        const newCurrentLangValue = {
          ...currentLangValue,
          [fieldName]: formattedFiles
        };

        form?.setFieldsValue({
          [listName]: {
            ...form?.getFieldValue(listName),
            [lang]: newCurrentLangValue
          }
        });
      } else {
        form.setFieldsValue({ [name as string]: formattedFiles });
      }

      if (!withIndex) {
        setUploadedImages?.(formattedFiles);
      }
    } catch (error) {
      console.error("Error handling file upload:", error);
    } finally {
      setLoading(false);
    }
  };

  const beforeUpload = () => {
    if (fileList.length >= imageLimit) {
      message.warning(`You can only upload up to ${imageLimit} images.`);
      return Upload.LIST_IGNORE;
    }
    return true;
  };

  const uploadButton = fileList.length < imageLimit && (
    <button style={{ border: 0, background: "none" }} type="button">
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>ატვირთვა</div>
    </button>
  );

  React.useEffect(() => {
    if (multiImages && !fileList.length) {
      setFileList(
        multiImages
          .filter((image) => image?.index === index)
          .map((image) => ({
            uid: `${index}`,
            name: image.name,
            size: image.size,
            status: "done",
            url: getFileUrl(image.path),
            path: image.path
          }))
      );
    } else if (images && !fileList.length) {
      setFileList(
        images.map((image, index) => ({
          uid: `${index}`,
          name: image.name,
          size: image.size,
          status: "done",
          url: getFileUrl(image.path),
          path: image.path
        }))
      );
    } else if (!fileList.length) {
      const formImages = form.getFieldValue("pictures") || [];
      setFileList(
        formImages.map((file: File, index: number) => ({
          uid: `${index}`,
          name: file.name,
          size: file.size,
          status: "done",
          url: getFileUrl(file.path),
          path: file.path
        }))
      );
    }
  }, [images]);

  return (
    <Form.Item
      label={label || "სურათები"}
      name={name}
      rules={[
        {
          required,
          message: "სურათები აუცილებელია!"
        }
      ]}
    >
      <Upload
        action={`${ADMIN_API_PATH}/upload/single`}
        listType="picture-circle"
        fileList={fileList}
        onPreview={handlePreview}
        maxCount={imageLimit}
        onChange={handleChange}
        beforeUpload={beforeUpload}
        accept=".jpg,.png,.jpeg,.webp,.mp4,.mov,.mkv"
      >
        {uploadButton}
      </Upload>
      {previewImage && (
        <Image
          wrapperStyle={{ display: "none" }}
          preview={{
            visible: previewOpen,
            onVisibleChange: (visible) => setPreviewOpen(visible),
            afterOpenChange: (visible) => !visible && setPreviewImage("")
          }}
          src={getFileUrl(previewImage)}
        />
      )}
    </Form.Item>
  );
};
