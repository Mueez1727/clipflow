'use client'

import { getWorkspaceMembers } from '@/actions/collab-workspace'
import {
  createVideoComment,
  deleteCommentReply,
  deleteVideoComment,
  editCommentReply,
  editVideoComment,
  getWorkspaceVideoComments,
  replyToVideoComment,
} from '@/actions/video-comments'
import { Button } from '@/components/ui/button'
import { useMutationData } from '@/hooks/useMutationData'
import { useQueryData } from '@/hooks/useQueryData'
import { cn, formatRelativeTime } from '@/lib/utils'
import {
  Clock,
  CornerDownRight,
  MessageSquare,
  Pencil,
  Send,
  Trash2,
  X,
} from 'lucide-react'
import React, { useState } from 'react'
import MentionTextarea, { MentionMember } from './mention-textarea'
import WorkspaceAvatar from './workspace-avatar'

type Author = {
  id: string
  firstname: string | null
  lastname: string | null
  image: string | null
} | null

type ReplyItem = {
  id: string
  content: string
  createdAt: string | Date
  isOwn: boolean
  User: Author
}

type CommentItem = {
  id: string
  content: string
  timestamp: number | null
  createdAt: string | Date
  isOwn: boolean
  User: Author
  replies: ReplyItem[]
}

type Props = {
  videoId: string
  workspaceId: string
  videoRef: React.RefObject<HTMLVideoElement>
}

export const formatTimestamp = (seconds: number) => {
  const total = Math.max(0, Math.floor(seconds))
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

const authorName = (author: Author) =>
  author
    ? `${author.firstname ?? ''} ${author.lastname ?? ''}`.trim() || 'Member'
    : 'Member'

const MENTION_SPLIT = /(@[a-zA-Z0-9_.-]+)/g

const renderContent = (content: string) =>
  content.split(MENTION_SPLIT).map((part, index) =>
    part.startsWith('@') ? (
      <span key={index} className="font-medium text-[#7C3AED]">
        {part}
      </span>
    ) : (
      <React.Fragment key={index}>{part}</React.Fragment>
    )
  )

const Avatar = ({
  author,
  small = false,
}: {
  author: Author
  small?: boolean
}) => {
  const name = authorName(author)
  const sizeClass = small ? 'h-7 w-7' : 'h-9 w-9'
  return author?.image ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={author.image}
      alt={name}
      className={cn(sizeClass, 'shrink-0 rounded-full object-cover')}
    />
  ) : (
    <WorkspaceAvatar
      name={name}
      className={cn(sizeClass, 'shrink-0 rounded-full text-xs')}
    />
  )
}

const VideoComments = ({ videoId, workspaceId, videoRef }: Props) => {
  const commentsKey = `workspace-video-comments-${videoId}`

  const { data } = useQueryData([commentsKey], () =>
    getWorkspaceVideoComments(videoId)
  )
  const { data: membersData } = useQueryData(
    ['workspace-members', workspaceId],
    () => getWorkspaceMembers(workspaceId)
  )

  const comments = (data as { data: CommentItem[] } | undefined)?.data ?? []
  const members = ((membersData as { data: MentionMember[] } | undefined)?.data ??
    []) as MentionMember[]

  const [content, setContent] = useState('')
  const [attachTime, setAttachTime] = useState(false)
  const [capturedTime, setCapturedTime] = useState<number | null>(null)

  const { mutate: addComment, isPending } = useMutationData(
    ['add-video-comment'],
    (payload: { content: string; timestamp: number | null }) =>
      createVideoComment(
        videoId,
        payload.content,
        workspaceId,
        payload.timestamp
      ),
    commentsKey,
    () => {
      setContent('')
      setAttachTime(false)
      setCapturedTime(null)
    }
  )

  const seekTo = (seconds: number) => {
    const video = videoRef.current
    if (!video) return
    video.currentTime = seconds
    video.play().catch(() => {})
    video.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  const toggleTimestamp = () => {
    if (attachTime) {
      setAttachTime(false)
      setCapturedTime(null)
      return
    }
    const current = videoRef.current?.currentTime ?? 0
    setCapturedTime(current)
    setAttachTime(true)
  }

  const submit = () => {
    if (!content.trim() || isPending) return
    addComment({
      content,
      timestamp: attachTime ? capturedTime ?? 0 : null,
    })
  }

  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="mb-4 flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-[#7C3AED]" />
        <h3 className="text-lg font-semibold text-foreground">
          Comments
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            {comments.length}
          </span>
        </h3>
      </div>

      <div className="mb-6 space-y-3">
        <MentionTextarea
          value={content}
          onChange={setContent}
          members={members}
          placeholder="Add a comment... use @ to mention a teammate"
        />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={toggleTimestamp}
            className={cn(
              'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
              attachTime
                ? 'border-[#7C3AED] bg-[#7C3AED]/10 text-[#7C3AED]'
                : 'border-border text-muted-foreground hover:border-[#7C3AED]/50 hover:text-foreground'
            )}
          >
            <Clock className="h-3.5 w-3.5" />
            {attachTime && capturedTime !== null
              ? `Comment at ${formatTimestamp(capturedTime)}`
              : 'Comment at Current Time'}
            {attachTime && <X className="h-3.5 w-3.5" />}
          </button>
          <Button
            onClick={submit}
            disabled={!content.trim() || isPending}
            className="clipflow-gradient gap-2 rounded-full text-white"
          >
            <Send className="h-4 w-4" />
            {isPending ? 'Posting...' : 'Comment'}
          </Button>
        </div>
      </div>

      <div className="space-y-5">
        {comments.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border py-10 text-center">
            <MessageSquare className="h-8 w-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              No comments yet. Be the first to leave feedback.
            </p>
          </div>
        ) : (
          comments.map((comment) => (
            <CommentCard
              key={comment.id}
              comment={comment}
              members={members}
              commentsKey={commentsKey}
              workspaceId={workspaceId}
              videoId={videoId}
              onSeek={seekTo}
            />
          ))
        )}
      </div>
    </div>
  )
}

const CommentCard = ({
  comment,
  members,
  commentsKey,
  workspaceId,
  videoId,
  onSeek,
}: {
  comment: CommentItem
  members: MentionMember[]
  commentsKey: string
  workspaceId: string
  videoId: string
  onSeek: (seconds: number) => void
}) => {
  const [replying, setReplying] = useState(false)
  const [replyContent, setReplyContent] = useState('')
  const [editing, setEditing] = useState(false)
  const [editContent, setEditContent] = useState(comment.content)

  const { mutate: postReply, isPending: replyPending } = useMutationData(
    ['reply-video-comment'],
    (payload: { content: string }) =>
      replyToVideoComment(comment.id, payload.content, workspaceId, videoId),
    commentsKey,
    () => {
      setReplyContent('')
      setReplying(false)
    }
  )

  const { mutate: saveEdit, isPending: editPending } = useMutationData(
    ['edit-video-comment'],
    (payload: { content: string }) =>
      editVideoComment(comment.id, payload.content),
    commentsKey,
    () => setEditing(false)
  )

  const { mutate: removeComment } = useMutationData(
    ['delete-video-comment'],
    () => deleteVideoComment(comment.id),
    commentsKey
  )

  return (
    <div className="flex gap-3">
      <Avatar author={comment.User} />
      <div className="min-w-0 flex-1">
        <div className="rounded-2xl rounded-tl-sm border border-border bg-card/60 px-4 py-3">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-foreground">
              {authorName(comment.User)}
            </span>
            {comment.timestamp !== null && (
              <button
                type="button"
                onClick={() => onSeek(comment.timestamp as number)}
                className="flex items-center gap-1 rounded-full bg-[#7C3AED]/10 px-2 py-0.5 text-xs font-medium text-[#7C3AED] transition-colors hover:bg-[#7C3AED]/20"
              >
                <Clock className="h-3 w-3" />
                {formatTimestamp(comment.timestamp)}
              </button>
            )}
            <span className="text-xs text-muted-foreground">
              {formatRelativeTime(comment.createdAt)}
            </span>
          </div>

          {editing ? (
            <div className="space-y-2">
              <MentionTextarea
                value={editContent}
                onChange={setEditContent}
                members={members}
                rows={2}
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => saveEdit({ content: editContent })}
                  disabled={editPending || !editContent.trim()}
                  className="clipflow-gradient text-white"
                >
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setEditing(false)
                    setEditContent(comment.content)
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <p className="whitespace-pre-wrap break-words text-sm text-foreground/90">
              {renderContent(comment.content)}
            </p>
          )}
        </div>

        {!editing && (
          <div className="mt-1.5 flex items-center gap-3 pl-1 text-xs text-muted-foreground">
            <button
              type="button"
              onClick={() => setReplying((v) => !v)}
              className="flex items-center gap-1 transition-colors hover:text-foreground"
            >
              <CornerDownRight className="h-3.5 w-3.5" />
              Reply
            </button>
            {comment.isOwn && (
              <>
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-1 transition-colors hover:text-foreground"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => removeComment({})}
                  className="flex items-center gap-1 transition-colors hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              </>
            )}
          </div>
        )}

        {replying && (
          <div className="mt-2 space-y-2">
            <MentionTextarea
              value={replyContent}
              onChange={setReplyContent}
              members={members}
              rows={2}
              placeholder="Write a reply..."
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => postReply({ content: replyContent })}
                disabled={replyPending || !replyContent.trim()}
                className="clipflow-gradient text-white"
              >
                Reply
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setReplying(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {comment.replies.length > 0 && (
          <div className="mt-3 space-y-3 border-l-2 border-border pl-4">
            {comment.replies.map((reply) => (
              <ReplyCard
                key={reply.id}
                reply={reply}
                members={members}
                commentsKey={commentsKey}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const ReplyCard = ({
  reply,
  members,
  commentsKey,
}: {
  reply: ReplyItem
  members: MentionMember[]
  commentsKey: string
}) => {
  const [editing, setEditing] = useState(false)
  const [editContent, setEditContent] = useState(reply.content)

  const { mutate: saveEdit, isPending } = useMutationData(
    ['edit-comment-reply'],
    (payload: { content: string }) =>
      editCommentReply(reply.id, payload.content),
    commentsKey,
    () => setEditing(false)
  )

  const { mutate: removeReply } = useMutationData(
    ['delete-comment-reply'],
    () => deleteCommentReply(reply.id),
    commentsKey
  )

  return (
    <div className="flex gap-2.5">
      <Avatar author={reply.User} small />
      <div className="min-w-0 flex-1">
        <div className="rounded-xl rounded-tl-sm border border-border bg-card/40 px-3 py-2">
          <div className="mb-0.5 flex items-center gap-2">
            <span className="text-xs font-semibold text-foreground">
              {authorName(reply.User)}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {formatRelativeTime(reply.createdAt)}
            </span>
          </div>
          {editing ? (
            <div className="space-y-2">
              <MentionTextarea
                value={editContent}
                onChange={setEditContent}
                members={members}
                rows={2}
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => saveEdit({ content: editContent })}
                  disabled={isPending || !editContent.trim()}
                  className="clipflow-gradient text-white"
                >
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setEditing(false)
                    setEditContent(reply.content)
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <p className="whitespace-pre-wrap break-words text-xs text-foreground/90">
              {renderContent(reply.content)}
            </p>
          )}
        </div>
        {reply.isOwn && !editing && (
          <div className="mt-1 flex items-center gap-3 pl-1 text-[11px] text-muted-foreground">
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="flex items-center gap-1 transition-colors hover:text-foreground"
            >
              <Pencil className="h-3 w-3" />
              Edit
            </button>
            <button
              type="button"
              onClick={() => removeReply({})}
              className="flex items-center gap-1 transition-colors hover:text-destructive"
            >
              <Trash2 className="h-3 w-3" />
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default VideoComments
