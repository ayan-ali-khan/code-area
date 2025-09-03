import React, { useState } from 'react'
import { Id } from '../../../../../convex/_generated/dataModel'
import { useUser } from '@clerk/nextjs'
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';

function Comments({snippetId}: {snippetId: Id<"snippets">}) {
  const {user} = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingComment, setDeletingComment] = useState<string | null>(null);

  const comments = useQuery(api.snippets.getComments, {snippetId});
  const addComment = useMutation(api.snippets.addComment);
  const deleteComment = useMutation(api.snippets.deleteComment)

  const handleSubmitComment = async (content:string) => {}

  const handleDeleteComment = async (commentId: Id<"snippetComments">) => {}

  return (
    <div>Comments</div>
  )
}

export default Comments