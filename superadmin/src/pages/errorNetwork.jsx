import { Result } from "antd";

const ErrorNetwork = () => {
  return (
    <>
      <Result
        status="500"
        title="500"
        subTitle="Sorry, something went wrong. Please try again later."
        // extra={<Button type="primary">Back Home</Button>}
      />
    </>
  );
};

export default ErrorNetwork;
