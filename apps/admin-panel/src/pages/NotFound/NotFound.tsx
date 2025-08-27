import { Button, Result } from "antd";
import { useNavigate } from "react-router-dom";

export const NotFound = ({ subTitle }: { subTitle?: string }) => {
  const navigate = useNavigate();

  const navigateBack = () => {
    navigate(-1);
  };

  return (
    <Result
      className="w-full"
      status="404"
      title="404"
      subTitle={subTitle || ""}
      extra={
        <Button type="primary" onClick={navigateBack}>
          This page not exist
        </Button>
      }
    />
  );
};
