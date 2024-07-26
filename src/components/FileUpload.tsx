"use client";
import { uploadToS3 } from "@/lib/s3";
import { useMutation } from "@tanstack/react-query";
import { Inbox } from "lucide-react";
import React from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

//sends files to the server

const FileUpload = () => {
  const router = useRouter();
  const [uploading, setUploading] = React.useState(false);
  const { mutate, isPending } = useMutation({
    mutationFn: async ({
      file_key,
      file_name,
    }: {
      file_key: string;
      file_name: string;
    }) => {
      try {
        const response = await axios.post("/api/create-chat", {
          file_key,
          file_name,
        });
        return response.data;
      } catch (error) {
        console.error("API Error", error);
      }
    },
  });

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      console.log(acceptedFiles);
      const file = acceptedFiles[0];
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File too large");
        return;
      }

      try {
        setUploading(true);
        const data = await uploadToS3(file);
        if (!data.file_key || !data.file_name) {
          toast.error(
            "Looks like your file went on a vacation. Let's try that upload again!"
          );
          return;
        }
        mutate(data, {
          onSuccess: (response) => {
            console.log("API response:", response); // Add this for debugging
            console.log(" chat_id:", response.chat_id); // Add this for debugging
            const chat_id = response.chat_id;
            console.log("Extracted chat_id:", chat_id); // Add this for debugging
            toast.success("Chat created");
            router.push(`/chat/${chat_id}`);
          },
          onError: (error) => {
            toast.error("Our chat server tripped over a wire. Let's give it a sec to recover.");
            console.error("Error creating chat", error);
          },
        });
      } catch (error) {
        console.log(error);
      } finally {
        setUploading(false);
      }
    },
  });

  return (
    <div className="p-2 bg-white rounded-xl">
      <div
        {...getRootProps({
          className:
            "border-dashed border-2 rounded-xl cursor-pointer bg-gray-50 py-8 flex justify-center items-center",
        })}
      >
        <input className="input-zone" {...getInputProps()} />
        {uploading || isPending ? (
          <>
            {/* loading state */}
            <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
            <p className="mt-1 ml-1 text-sm text-slate-400">
              Spilling Tea to GPT...
            </p>
          </>
        ) : (
          <div className="flex-col">
            <Inbox className="w-10 h-10 text-purple-500 ml-9" />
            <p className="mt-2 text-sm text-slate-400">Drop your PDF here</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
