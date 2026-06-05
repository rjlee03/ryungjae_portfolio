/**
 * \file
 * \author Rudy Castan
 * \author Ryungjae Lee
 * \date 2026 Spring
 * \par CS250 Computer Graphics II
 * \copyright DigiPen Institute of Technology
 */

#include "VertexArray.hpp"

#include "GL.hpp"
#include <GL/glew.h>
#include <gsl/gsl>

namespace opengl
{

    VertexArray::VertexArray(Primitive::Type the_primitive_pattern)
    {
        primitive_pattern = the_primitive_pattern;
        GL::GenVertexArrays(1, &vertex_array_handle);
    }

    VertexArray::~VertexArray()
    {
        GL::DeleteVertexArrays(1, &vertex_array_handle);
    }

    VertexArray::VertexArray(VertexArray&& temp) noexcept
        : vertex_array_handle(temp.vertex_array_handle), vertex_buffers(std::move(temp.vertex_buffers)), index_buffer(std::move(temp.index_buffer)), num_indices(temp.num_indices),
          indices_type(temp.indices_type), primitive_pattern(temp.primitive_pattern), num_vertices(temp.num_vertices)
    {
        temp.vertex_array_handle = 0;
        temp.num_indices         = 0;
        temp.indices_type        = IndexElement::None;
        temp.num_vertices        = 0;
    }

    VertexArray& VertexArray::operator=(VertexArray&& temp) noexcept
    {
        std::swap(vertex_array_handle, temp.vertex_array_handle);
        std::swap(vertex_buffers, temp.vertex_buffers);
        std::swap(index_buffer, temp.index_buffer);
        std::swap(num_indices, temp.num_indices);
        std::swap(indices_type, temp.indices_type);
        std::swap(primitive_pattern, temp.primitive_pattern);
        std::swap(num_vertices, temp.num_vertices);

        return *this;
    }

    void VertexArray::Use(bool bind) const
    {
        GL::BindVertexArray(bind ? vertex_array_handle : 0);
    }

    void VertexArray::AddVertexBuffer(VertexBuffer&& vertex_buffer, BufferLayout buffer_layout)
    {
        Use(true);
        vertex_buffer.Use(true);

        GLsizei stride = 0;
        for (const auto& attr : buffer_layout.Attributes)
            stride += attr.SizeBytes;

        GLsizei offset        = static_cast<GLsizei>(buffer_layout.BufferStartingByteOffset);
        GLuint  attr_index    = 0;

        for (const auto& attribute : buffer_layout.Attributes)
        {
            if (attribute == Attribute::None)
                continue;
            GL::EnableVertexAttribArray(attr_index);
            if (attribute.IntAttribute)
            {
                GL::VertexAttribIPointer(attr_index, attribute.ComponentCount, attribute.GLType, stride, reinterpret_cast<const void*>(static_cast<intptr_t>(offset)));
            }
            else
            {
                GL::VertexAttribPointer(attr_index, attribute.ComponentCount, attribute.GLType, attribute.Normalize, stride, reinterpret_cast<const void*>(static_cast<intptr_t>(offset)));
            }
            GL::VertexAttribDivisor(attr_index, attribute.Divisor);
            ++attr_index;
            offset += attribute.SizeBytes;
        }

        Use(false);
        vertex_buffer.Use(false);

        vertex_buffers.emplace_back(std::move(vertex_buffer));
    }

    void VertexArray::SetIndexBuffer(IndexBuffer&& the_indices)
    {
        num_indices  = the_indices.GetCount();
        indices_type = the_indices.GetElementType();
        Use(true);
        the_indices.Use(true);
        index_buffer = std::move(the_indices);
    }

    void DrawIndexed(const VertexArray& vertex_array) noexcept
    {
        vertex_array.Use(true);
        GL::DrawElements(vertex_array.GetPrimitivePattern(), vertex_array.GetIndicesCount(), vertex_array.GetIndicesType(), nullptr);
        vertex_array.Use(false);
    }

    void DrawVertices(const VertexArray& vertex_array) noexcept
    {
        vertex_array.Use(true);
        GL::DrawArrays(vertex_array.GetPrimitivePattern(), 0, vertex_array.GetVertexCount());
        vertex_array.Use(false);
    }
}
