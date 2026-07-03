import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { dummyProjects } from "../assets/assets";
import { Loader2Icon } from "lucide-react";
import ProjectPreview from "../components/ProjectPreview";
import type { Project, Version } from "../types";
import { toast } from "sonner";
import api from "@/configs/Axios";
import { authClient } from "@/lib/auth-client";

const Preview = () => {

  const { data: session, isPending } = authClient.useSession()
  const { projectId, versionId } = useParams();

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchCode = async () => {
    try {
      const { data } = await api.get(`/api/project/preview/${projectId}`)
      setCode(data.project.current_code)

      if (versionId) {
        data.project.versions.forEach((version: Version) => {
          if (version.id === versionId) {
            setCode(version.code)
          }
        })
      }

      setLoading(false)
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message);
      console.log(error);
    }
  }

  useEffect(() => {
    if (!isPending && session?.user) {
      fetchCode()
    }
  }, [session?.user])


  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2Icon className="size-7 animate-spin text-indigo-200" />
      </div>
    )
  }

  return (
    <div className="h-screen">
      {code &&
        <ProjectPreview
          project={{ current_code: code } as Project}
          isGenerating={false} showEditorPanel={false} />}
    </div>
  )

}

export default Preview


