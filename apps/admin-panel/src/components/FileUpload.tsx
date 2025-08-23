import { App, Form, GetProp, Image, Upload, UploadProps } from "antd";
import { useEffect, useState } from "react";
import { LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import { FormInstance } from "antd/lib";
import { UploadResponse } from "@/types";
import { ADMIN_API_PATH, VITE_API_URL } from "@/utils";

type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

const getBase64 = (img: FileType, callback: (url: string) => void) => {
  const reader = new FileReader();
  reader.addEventListener("load", () => callback(reader.result as string));
  reader.readAsDataURL(img);
};

type FileUploadProps = {
  form: FormInstance;
  name: string | string[];
  label: string | string[];
  setDocument?: (fileData: {
    name: string;
    path: string;
    size: number;
  }) => void;
};

export const FileUpload = ({
  form,
  name,
  label,
  setDocument
}: FileUploadProps) => {
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>();
  const { message } = App.useApp();

  const handleChange: UploadProps["onChange"] = (info) => {
    if (info.file.status === "uploading") {
      setLoading(true);
      return;
    }

    if (info.file.status === "error") {
      setLoading(false);
      return message.error("ატვირტისას მოხდა შეცდომა");
    }

    if (info.file.status === "done") {
      const response = info.file.response.data as UploadResponse;
      const fileData = {
        name: response.filename,
        path: response.path,
        size: response.size
      };

      form.setFieldsValue({
        [Array.isArray(name) ? name.join(".") : name]: fileData
      });

      if (setDocument) {
        setDocument(fileData);
      }

      getBase64(info.file.originFileObj as FileType, (imageUrl) => {
        setLoading(false);
        setImageUrl(imageUrl);
      });
    }
  };

  useEffect(() => {
    const value = form.getFieldValue(name);
    if (value?.path) {
      const defaultImageUrl = `${VITE_API_URL}/${value.path}`;
      setImageUrl(defaultImageUrl);
    }
  }, [form, name]);

  const uploadButton = (
    <button style={{ border: 0, background: "none" }} type="button">
      {loading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>{"ატვირთვა"}</div>
    </button>
  );

  return (
    <Form.Item
      name={name}
      label={label}
      valuePropName="file"
      normalize={(value) => {
        const file = value?.fileList?.[0]?.response?.data;

        return {
          name: file?.filename,
          path: file?.path,
          size: file?.size
        };
      }}
    >
      <Upload
        name="file"
        listType="picture-circle"
        className="avatar-uploader"
        showUploadList={false}
        action={`${ADMIN_API_PATH}/upload/single`}
        onChange={handleChange}
        accept="image/*"
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt="avatar"
            style={{
              objectFit: "cover",
              borderRadius: "50%"
            }}
            width={100}
            height={100}
            preview={false}
          />
        ) : (
          uploadButton
        )}
      </Upload>
    </Form.Item>
  );
};
