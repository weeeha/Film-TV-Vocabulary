import Image from "next/image";
export function Illustration(props: {
  src: string;
  alt: string;
  width: number;
  height: number;
}) {
  return (
    <Image
      {...props}
      sizes="(max-width: 600px) 90vw, (max-width: 1280px) 35vw, 360px"
      className="illustration"
    />
  );
}
