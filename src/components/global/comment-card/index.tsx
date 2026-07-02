'use client'
import CommentForm from '@/components/forms/comment-form'
import { Avatar, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { CommentRepliesProps } from '@/types/index.type'
import { DotIcon } from 'lucide-react'
import React, { useState } from 'react'

type Props = {
  comment: string
  author: { image: string; firstname: string; lastname: string }
  videoId: string
  commentId?: string
  reply: CommentRepliesProps[]
  isReply?: boolean
  createdAt: Date
}

const CommentCard = ({
  author,
  comment,
  reply,
  videoId,
  commentId,
  isReply,
  createdAt,
}: Props) => {
  const [onReply, setOnReply] = useState<boolean>(false)
  const daysAgo = Math.floor(
    (new Date().getTime() - createdAt.getTime()) / (24 * 60 * 60 * 1000)
  )

  return (
    <Card
      className={cn(
        isReply
          ? 'border-none bg-card pl-10 shadow-none'
          : 'border border-border bg-card p-5 shadow-none',
        'relative'
      )}
    >
      <div className="flex gap-x-2 items-center">
        <Avatar>
          <AvatarImage
            src={author.image}
            alt="author"
          />
        </Avatar>
        <p className="flex text-sm capitalize text-muted-foreground">
          {author.firstname} {author.lastname}{' '}
          <div className="flex items-center gap-[0]">
            <DotIcon className="text-muted-foreground" />
            <span className="ml-[-6px] text-xs text-muted-foreground">
              {daysAgo === 0 ? 'Today' : `${daysAgo}d ago`}
            </span>
          </div>
        </p>
      </div>
      <div>
        <p className="text-foreground">{comment}</p>
      </div>
      {!isReply && (
        <div className="flex justify-end mt-3 ">
          {!onReply ? (
            <Button
              onClick={() => setOnReply(true)}
              className="btn-clipflow-outline absolute top-8 z-[1] rounded-full text-sm"
            >
              Reply
            </Button>
          ) : (
            <CommentForm
              close={() => setOnReply(false)}
              videoId={videoId}
              commentId={commentId}
              author={author.firstname + ' ' + author.lastname}
            />
          )}
        </div>
      )}
      {reply.length > 0 && (
        <div className="flex flex-col gap-y-10 mt-5  border-l-2">
          {reply.map((r) => (
            <CommentCard
              isReply
              reply={[]}
              comment={r.comment}
              commentId={r.commentId!}
              videoId={videoId}
              key={r.id}
              author={{
                image: r.User?.image ?? '/default-avatar.png',
                firstname: r.User?.firstname ?? 'Unknown',
                lastname: r.User?.lastname ?? '',
              }}
              createdAt={r.createdAt}
            />
          ))}
        </div>
      )}
    </Card>
  )
}

export default CommentCard