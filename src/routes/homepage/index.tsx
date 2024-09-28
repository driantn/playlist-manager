import { ChangeEvent } from "react";
import { storeActions, useOriginalContent } from "../../store";
import { parseM3U } from "@iptv/playlist";
import { Navigate } from "@tanstack/react-router";

export const Homepage = () => {
  const { setOriginalContent } = storeActions();
  const originalContent = useOriginalContent();

  const getContentFromFile = async (file: File) => {
    const content = await file.text();
    return content;
  };

  const onFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const { files } = event.target;
    if (!files) return;

    const [m3uFile] = files;
    const initialContent = await getContentFromFile(m3uFile);
    const parsedContent = parseM3U(initialContent);

    setOriginalContent(parsedContent.channels);
  };

  if (originalContent) return <Navigate to="/editor" search={{ group: "" }} />;

  return (
    <div className="container size-full m-auto flex flex-col items-center justify-center">
      <form className="flex items-center space-x-6">
        <label className="block">
          <span className="sr-only">Choose profile photo</span>
          <input
            type="file"
            accept=".m3u"
            onChange={onFileChange}
            className="block w-full text-sm text-slate-500
        file:mr-4 file:py-2 file:px-4
        file:rounded-full file:border-0
        file:text-sm file:font-semibold
      "
          />
        </label>
      </form>
    </div>
  );
};
