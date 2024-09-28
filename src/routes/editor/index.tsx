import { useNavigate, useSearch } from "@tanstack/react-router";
import { storeActions, useFinalContent, useOriginalContent } from "../../store";
import { ChangeEvent } from "react";
import { writeM3U } from "@iptv/playlist";
import fileDownload from "js-file-download";
import { Navigate } from "@tanstack/react-router";

export const Editor = () => {
  const navigate = useNavigate();
  const group = useSearch({
    from: "/editor",
    select: (search) => search.group,
  });
  const { addGroup, removeGroup } = storeActions();
  const originalContent = useOriginalContent();
  const finalContent = useFinalContent() || {};
  const groupeTitles = new Set(
    originalContent?.map((c) => c.groupTitle).sort(),
  );
  const groupedContents = originalContent
    ? Object.groupBy(originalContent, (c) => c.groupTitle || "OTHER")
    : {};

  const channels = groupedContents[group] || [];
  const contentsFromGroup = finalContent[group] || [];

  const onSelectAll = (event: ChangeEvent<HTMLInputElement>) => {
    const { checked, name } = event.currentTarget;
    if (!name || !groupedContents) return;
    if (checked) return addGroup(name, groupedContents[name] || []);

    removeGroup(name);
  };

  const onSelectSingleItem = (event: ChangeEvent<HTMLInputElement>) => {
    const { checked, name } = event.currentTarget;
    console.log({ checked, name, groupedContents });
  };

  const onExport = () => {
    const playlistObject = {
      channels: Object.values(finalContent).flat(),
      headers: {},
    };
    const m3u = writeM3U(playlistObject);
    fileDownload(m3u, "channels.m3u");
  };

  if (!originalContent) return <Navigate to="/" />;

  return (
    <div className="size-full flex flex-row">
      <div className="w-[20%] shrink-0 h-screen overflow-y-auto divide-y">
        {Array.from(groupeTitles.values()).map((title) => {
          return (
            <div
              key={title}
              className="flex flex-row justify-between gap-4 p-2  hover:bg-slate-300 hover:cursor-pointer"
              onClick={() => {
                navigate({
                  from: "/editor",
                  search: (old) => ({
                    ...old,
                    group: title || "",
                  }),
                });
              }}
            >
              {title}

              <input
                name={title}
                className="shrink-0"
                type="checkbox"
                onChange={onSelectAll}
                checked={!!finalContent[title || ""] || false}
              />
            </div>
          );
        })}
      </div>
      <div className="w-full h-screen overflow-y-auto flex flex-col divide-y">
        <div className="sticky top-0 w-full p-3 text-right bg-slate-200">
          <button
            className="inline-block p-2 bg-slate-400 text-white rounded-md"
            onClick={onExport}
          >
            Export
          </button>
        </div>
        {channels.map(({ name, url }) => {
          return (
            <div
              key={`${name}${url}`}
              className="flex flex-row gap-4 p-2 hover:bg-slate-300 hover:cursor-pointer justify-between"
            >
              <label htmlFor={name}>{name}</label>
              <input
                className="shrink-0"
                type="checkbox"
                id={name}
                name={name}
                checked={
                  !!contentsFromGroup.find((c) => c.name === name) || false
                }
                onChange={onSelectSingleItem}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
