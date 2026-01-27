'use client';

import { Node, mergeAttributes, nodeInputRule, Editor } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { ImageUploadView } from './ImageUploadView';

export interface ImageUploadOptions {
  inline: boolean;
  allowBase64: boolean;
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    imageUpload: {
      /**
       * Add an image
       */
      setImage: (options: { src: string; alt?: string; title?: string }) => ReturnType;
      /**
       * Upload an image
       */
      uploadImage: (file: File) => ReturnType;
    };
  }
}

const inputRegex = /(?:^|\s)(!\[(.+|:?)]\((\S+)(?:(?:\s+)["'](\S+)["'])?\))$/;

// Helper function to handle upload errors
function handleUploadError(fileName: string, error: string, editor: Editor) {
  const { state } = editor;
  const { doc } = state;
  let pos = -1;

  doc.descendants((node, nodePos) => {
    if (
      node.type.name === 'imageUpload' &&
      node.attrs.loading &&
      node.attrs.alt === fileName
    ) {
      pos = nodePos;
      return false;
    }
  });

  if (pos >= 0) {
    editor
      .chain()
      .focus()
      .setNodeSelection(pos)
      .updateAttributes('imageUpload', {
        loading: false,
        error,
      })
      .run();
  }
}

// Helper function to upload a file
function uploadFile(file: File, editor: Editor) {
  const formData = new FormData();
  formData.append('file', file);

  fetch('/api/images/upload', {
    method: 'POST',
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        // Find the loading image node and replace it with the uploaded image
        const { state } = editor;
        const { doc } = state;
        let pos = -1;

        doc.descendants((node, nodePos) => {
          if (
            node.type.name === 'imageUpload' &&
            node.attrs.loading &&
            node.attrs.alt === file.name
          ) {
            pos = nodePos;
            return false;
          }
        });

        if (pos >= 0) {
          editor
            .chain()
            .focus()
            .setNodeSelection(pos)
            .updateAttributes('imageUpload', {
              src: data.data.url,
              loading: false,
              error: null,
            })
            .run();
        }
      } else {
        // Handle upload error
        handleUploadError(file.name, data.error, editor);
      }
    })
    .catch((error) => {
      console.error('Upload error:', error);
      handleUploadError(file.name, 'Upload failed', editor);
    });
}

export const ImageUpload = Node.create<ImageUploadOptions>({
  name: 'imageUpload',

  addOptions() {
    return {
      inline: false,
      allowBase64: false,
      HTMLAttributes: {},
    };
  },

  inline() {
    return this.options.inline;
  },

  group() {
    return this.options.inline ? 'inline' : 'block';
  },

  draggable: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      alt: {
        default: null,
      },
      title: {
        default: null,
      },
      width: {
        default: null,
      },
      height: {
        default: null,
      },
      loading: {
        default: false,
      },
      error: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'img[src]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['img', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)];
  },

  addCommands() {
    return {
      setImage:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
      uploadImage:
        (file) =>
        ({ commands, editor }) => {
          // Insert a loading placeholder
          const loadingNode = {
            type: this.name,
            attrs: {
              src: '',
              alt: file.name,
              loading: true,
            },
          };

          commands.insertContent(loadingNode);

          // Upload the file
          uploadFile(file, editor);

          return true;
        },
    };
  },

  addInputRules() {
    return [
      nodeInputRule({
        find: inputRegex,
        type: this.type,
        getAttributes: (match) => {
          const [, , alt, src, title] = match;
          return { src, alt, title };
        },
      }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageUploadView);
  },

  addProseMirrorPlugins() {
    const editor = this.editor;

    return [
      new Plugin({
        key: new PluginKey('imageUploadPlugin'),
        props: {
          handleDOMEvents: {
            drop: (view, event) => {
              const hasFiles = event.dataTransfer?.files?.length;

              if (!hasFiles) {
                return false;
              }

              const images = Array.from(event.dataTransfer.files).filter((file) =>
                /image/i.test(file.type)
              );

              if (images.length === 0) {
                return false;
              }

              event.preventDefault();

              const { schema } = view.state;
              const coordinates = view.posAtCoords({
                left: event.clientX,
                top: event.clientY,
              });

              if (!coordinates) return false;

              images.forEach((image) => {
                const node = schema.nodes.imageUpload.create({
                  src: '',
                  alt: image.name,
                  loading: true,
                });

                const transaction = view.state.tr.insert(coordinates.pos, node);
                view.dispatch(transaction);

                uploadFile(image, editor);
              });

              return true;
            },
            paste: (view, event) => {
              const hasFiles = event.clipboardData?.files?.length;

              if (!hasFiles) {
                return false;
              }

              const images = Array.from(event.clipboardData.files).filter((file) =>
                /image/i.test(file.type)
              );

              if (images.length === 0) {
                return false;
              }

              event.preventDefault();

              images.forEach((image) => {
                const node = view.state.schema.nodes.imageUpload.create({
                  src: '',
                  alt: image.name,
                  loading: true,
                });

                const transaction = view.state.tr.replaceSelectionWith(node);
                view.dispatch(transaction);

                uploadFile(image, editor);
              });

              return true;
            },
          },
        },
      }),
    ];
  },
});
